#ifndef MODEL_H
#define MODEL_H
#define STB_IMAGE_IMPLEMENTATION

// GLEW
#include <GL/glew.h>

// GLFW
#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

#include "mesh.h"
#include "Shader.h"
#include "estruturas.h"
#include "OBJReader.h"
#include "MtlReader.h"
#include "stb_image.h"

#include <string>
#include <fstream>
#include <sstream>
#include <iostream>
#include <map>
#include <vector>
using namespace std;

unsigned int TextureFromFile(const char *path, const string &directory);
void setupMesh(unsigned int &VAO, vector<Vertex*> *allVertex,
	vector<unsigned int> *allIndex, vector<Vertex*> *allNormals, vector<TextureMapping*> *allMappings);
class Model
{
public:
	/*  Model Data */
	vector<Texture> textures_loaded;	// stores all the textures loaded so far, optimization to make sure textures aren't loaded more than once.
	vector<Mesh*> objetos;
	map<string, Material*> materials;
	string directory;
	ObjReader *objReader = new ObjReader();
	MltReader *mtlReader = new MltReader();
	bool gammaCorrection;
	unsigned int VAO;

	/*  Functions   */
	// constructor, expects a filepath to a 3D model.
	Model(string const &path, bool gamma = false) : gammaCorrection(gamma)
	{
		loadModel(path);
		setupMesh(VAO, objetos.at(0)->getAllVertex(), objetos.at(0)->getAllIndex(), objetos.at(0)->getAllNormals(), objetos.at(0)->getAllMappings());
	}

	// draws the model, and thus all its meshes
	void Draw(Shader shader)
	{	

		for (size_t i = 0; i < objetos.capacity(); i++)
		{
		// bind appropriate textures
		for (unsigned int i = 0; i < textures_loaded.size(); i++)
		{
			glActiveTexture(GL_TEXTURE0 + i); // active proper texture unit before binding
											  // retrieve texture number (the N in diffuse_textureN)
			string number = "1";
			string name = "texture_diffuse";
													 // now set the sampler to the correct texture unit
			glUniform1i(glGetUniformLocation(shader.Program, (name + number).c_str()), i);
			// and finally bind the texture
			glBindTexture(GL_TEXTURE_2D, textures_loaded.at(i).id);
		}

		// draw mesh
		glBindVertexArray(VAO);
		glDrawElements(GL_TRIANGLES, objetos.at(i)->getAllIndex()->size(), GL_UNSIGNED_INT, 0);
		glBindVertexArray(0);

		// always good practice to set everything back to defaults once configured.
		glActiveTexture(GL_TEXTURE0);
		}
	}

private:
	/*  Functions   */
	// loads a model with supported ASSIMP extensions from file and stores the resulting meshes in the meshes vector.
	void loadModel(string const &path)
	{
		ObjSpec *spec2 = objReader->readObjFile(path);
		mtlReader->readMtlFile(spec2->getMtllibFilename(), &materials);

		objetos.push_back(spec2->getMesh());

		directory = path.substr(0, path.find_last_of('/'));
		loadMaterialTextures();
	}
	
	// checks all material textures of a given type and loads the textures if they're not loaded yet.
	// the required info is returned as a Texture struct.
	vector<Texture> loadMaterialTextures()
	{
		vector<Texture> textures;
		for (auto it : materials) {
				Texture texture;
				texture.id = TextureFromFile(it.second->getMapKd().c_str(), this->directory);
				texture.type = it.second->getTextureId();
				texture.path = "texture_diffuse";
				textures.push_back(texture);
				textures_loaded.push_back(texture);  // store it as texture loaded for entire model, to ensure we won't unnecesery load duplicate textures.
		}
		return textures;
	}
};


unsigned int TextureFromFile(const char *path, const string &directory)
{
	string filename = string(path);
	filename = filename;
	const char* file = filename.c_str();
	unsigned int textureID;
	glGenTextures(1, &textureID);

	int width, height, nrComponents;
	unsigned char *data = stbi_load(file, &width, &height, &nrComponents, 0);
	if (data)
	{
		GLenum format;
		if (nrComponents == 1)
			format = GL_RED;
		else if (nrComponents == 3)
			format = GL_RGB;
		else if (nrComponents == 4)
			format = GL_RGBA;

		glBindTexture(GL_TEXTURE_2D, textureID);
		glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, data);
		glGenerateMipmap(GL_TEXTURE_2D);

		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

		stbi_image_free(data);
	}
	else
	{
		std::cout << "Texture failed to load at path: " << path << std::endl;
		stbi_image_free(data);
	}

	return textureID;
}

void setupMesh(unsigned int &VAO, vector<Vertex*> *allVertex, 
	vector<unsigned int>* allIndex, vector<Vertex*> *allNormals, vector<TextureMapping*> *allMappings)
{
	unsigned int VBO, EBO, vVBO, tVBO;
	// create buffers/arrays
	glGenVertexArrays(1, &VAO);
	glGenBuffers(1, &VBO);
	glGenBuffers(1, &EBO);
	glGenBuffers(1, &vVBO);
	glGenBuffers(1, &tVBO);
	glBindVertexArray(VAO);
	// load data into vertex buffers
	// A great thing about structs is that their memory layout is sequential for all its items.
	// The effect is that we can simply pass a pointer to the struct and it translates perfectly to a glm::vec3/2 array which
	// again translates to 3/2 floats which translates to a byte array.
	glBindBuffer(GL_ARRAY_BUFFER, VBO);
	glBufferData(GL_ARRAY_BUFFER, allVertex->capacity() * sizeof(Vertex), allVertex , GL_STATIC_DRAW);

	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, allIndex->size() * sizeof(unsigned int), allIndex, GL_STATIC_DRAW);

	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vVBO);
	glBufferData(GL_ARRAY_BUFFER, allNormals->capacity() * sizeof(Vertex), allNormals, GL_STATIC_DRAW);

	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, tVBO);
	glBufferData(GL_ARRAY_BUFFER, allMappings->capacity() * sizeof(TextureMapping), allMappings, GL_STATIC_DRAW);


	// set the vertex attribute pointers
	// vertex Positions
	glBindBuffer(GL_ARRAY_BUFFER, VBO);
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (GLvoid*)0);
	// vertex normals
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, vVBO);
	glEnableVertexAttribArray(1);
	glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (GLvoid*)0);
	// vertex texture coords
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, tVBO);
	glEnableVertexAttribArray(2);
	glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, sizeof(TextureMapping), (GLvoid*)(0));

	glEnable(GL_DEPTH_TEST);

	glBindVertexArray(0);
}
#endif


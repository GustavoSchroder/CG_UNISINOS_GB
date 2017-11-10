#ifndef ESTRUTURAS_H
#define ESTRUTURAS_H

#include <vector>
#include <GL/glew.h>
#include <GLFW/glfw3.h>

using namespace std;

class TextureMapping {
private:
	GLfloat coord[2];
public:
	TextureMapping(GLfloat x, GLfloat y) {
		coord[0] = x;
		coord[1] = y;
	}
	GLfloat* getCoord() {
		return coord;
	}
};

class Material {
private:
	string id;
	GLfloat *ka;
	GLfloat *kd;
	GLfloat *ks;
	GLfloat ns;
	string mapKd;
	GLint textureId;
public:
	Material() {}
	void setKa(GLfloat *a) {
		ka = a;
	}
	void setKd(GLfloat *d) {
		kd = d;
	}
	void setKs(GLfloat *s) {
		ks = s;
	}
	void setNs(GLfloat n) {
		ns = n;
	}
	void setMapKd(string m) {
		mapKd = m;
	}
	void setId(string i) {
		id = i;
	}
	void setTextureId(GLint id) {
		textureId = id;
	}
	string getId() {
		return id;
	}
	GLfloat* getKa() {
		return ka;
	}
	GLfloat* getKs() {
		return ks;
	}
	GLfloat getNs() {
		return ns;
	}
	GLfloat* getKd() {
		return kd;
	}
	string getMapKd() {
		return mapKd;
	}
	GLint getTextureId() {
		return textureId;
	}
	bool hasTexture() {
		return !mapKd.empty();
	}
};

class Vertex {
private:
	GLfloat coord[3];
public:
	Vertex(GLfloat x, GLfloat y, GLfloat z) {
		coord[0] = x;
		coord[1] = y;
		coord[2] = z;
	};
	void update(GLfloat x, GLfloat y, GLfloat z) {
		coord[0] = x;
		coord[1] = y;
		coord[2] = z;
	}
	GLfloat getX() {
		return coord[0];
	}
	GLfloat getY() {
		return coord[1];
	}
	GLfloat getZ() {
		return coord[2];
	}
	GLfloat* getCoord() {
		return coord;
	}
	void addX(GLfloat nx) {
		coord[0] = coord[0] + nx;
	}
	void addY(GLfloat ny) {
		coord[1] = coord[1] + ny;
	}
	void addZ(GLfloat nz) {
		coord[2] = coord[2] + nz;
	}
	void addXYZ(GLfloat x, GLfloat y, GLfloat z) {
		addX(x);
		addY(y);
		addZ(z);
	}

};

class Group {
private:
	string name;
	string material;
	vector<Vertex*> *vertex;
	vector<Vertex*> *normals;
	vector<TextureMapping*> *mappings;
	vector<Vertex*> *index;
	int sizeVertex;
	int sizeNormals;
	int sizeMappings;
	int sizeIndex;
	bool enable;
public:
	Group(string nme, string mat, vector<Vertex*> *v, vector<Vertex*> *n, vector<TextureMapping*> *m, vector<Vertex*> *i) {
		name = nme;
		material = mat;
		vertex = v;
		normals = n;
		mappings = m;
		index = i;
	}
	Group() {
		vertex = new vector<Vertex*>();
		normals = new vector<Vertex*>();
		index = new vector<Vertex*>();
		mappings = new vector<TextureMapping*>();
		sizeVertex = 0;
		sizeNormals = 0;
		sizeMappings = 0;
		sizeIndex = 0;
	}
	vector<Vertex*>* getVertex() {
		return vertex;
	}
	vector<Vertex*>* getNormals() {
		return normals;
	}
	vector<TextureMapping*>* getMappings() {
		return mappings;
	}
	vector<Vertex*>* getIndex() {
		return index;
	}
	string getName() {
		return name;
	}
	void setName(string n) {
		name = n;
	}
	void setMaterial(string m) {
		material = m;
	}
	string getMaterial() {
		return material;
	}
	bool getEnable() {
		return enable;
	}
	void enableGroup() {
		enable = true;
	}
	void disableGroup() {
		enable = false;
	}
	int getSizeVertex() {
		return sizeVertex;
	}
	int getSizeNormals() {
		return sizeNormals;
	}
	int getSizeMappings() {
		return sizeMappings;
	}
	int getSizeIndex() {
		return sizeIndex;
	}
	void setSizeVertex(int value) {
		sizeVertex = value;
	}
	void setSizeNormals(int value) {
		sizeNormals = value;
	}
	void setSizeMappings(int value) {
		sizeMappings = value;
	}
	void setSizeIndex(int value) {
		sizeIndex = value;
	}

};

class Mesh {
private:
	vector<Group*> *groups;
	int sizeGroups;
	vector<Vertex*> *allVertex;
	vector<Vertex*> *allNormals;
	vector<TextureMapping*> *allMappings;
	vector<Vertex*> *allIndex;
public:
	Mesh(vector<Group*> *g, vector<Vertex*> *v, vector<Vertex*> *n, vector<TextureMapping*> *m, vector<Vertex*> *ai, int sg) {
		groups = g;
		allVertex = v;
		allNormals = n;
		allMappings = m;
		allIndex = ai;
		sizeGroups = sg;
	}
	Mesh() {
		groups = new vector<Group*>();
		allVertex = new vector<Vertex*>();
		allNormals = new vector<Vertex*>();
		allMappings = new vector<TextureMapping*>();
		allIndex = new vector<Vertex*>();
		sizeGroups = 0;
	}
	vector<Group*>* getGroups() {
		return groups;
	}
	vector<Vertex*>* getAllVertex() {
		return allVertex;
	}
	vector<Vertex*>* getAllNormals() {
		return allNormals;
	}
	vector<TextureMapping*>* getAllMappings() {
		return allMappings;
	}
	vector<Vertex*>* getAllIndex() {
		return allIndex;
	}

	int getSizeGroups() {
		return sizeGroups;
	}

	void setSizeGroups(int value) {
		sizeGroups = value;
	}
};

class ObjSpec {
private:
	Mesh *mesh;
	string mtllibFileName;
public:
	ObjSpec(Mesh *m, string mtl) {
		mesh = m;
		mtllibFileName = mtl;
	}
	Mesh* getMesh() {
		return mesh;
	}
	string getMtllibFilename() {
		return mtllibFileName;
	}
	void setMesh(Mesh *m) {
		mesh = m;
	}
	void setMtllibFilename(string filename) {
		mtllibFileName = filename;
	}
};

struct Texture {
    unsigned int id;
    string type;
    string path;
};


#endif

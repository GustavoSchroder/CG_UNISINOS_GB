/*@Gustavo Lazarotto Schroeder*/
#include <iostream>
#include <string>
#include <cstring>
#include <vector>

using namespace std;

// GLEW
#include <GL/glew.h>

// GLFW
#include <GLFW/glfw3.h>

// GLM
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <stdio.h>      /* printf, NULL */
#include <stdlib.h>     /* strtof */
#include <cmath>

// Nossa classezinha que lê o arquivo de shader e o compila na OpenGL
// Exemplo retirado de https://learnopengl.com/#!Getting-started/Shaders
#include "Shader.h"
#include "Camera.h"
#include "model.h"

 int size_vertex;
 int size_indices;
 int size_normals;
 int size_texturas;
 int size_mtl;
 string file = "Pikachu.obj";
 glm::vec3 position = glm::vec3(0.0f, 0.0f, 0.0f);
 float goUp = 0.0f;
 float goRightLeft = 0.0f;
 float goOnZ = 0.0f;
 float rotateWithp = 1.0f;
 float up = 1.0f;
 float down = 1.0f;

// Function prototypes
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mode);

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void mouse_callback(GLFWwindow* window, double xpos, double ypos);
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset);
void processInput(GLFWwindow *window);
// Window dimensions
const GLuint WIDTH = 800, HEIGHT = 600;
// camera
Camera camera(glm::vec3(0.0f, 0.0f, 3.0f));
float lastX = WIDTH / 2.0f;
float lastY = HEIGHT / 2.0f;
bool firstMouse = true;

// timing
float deltaTime = 0.0f;	//tempo entre o frame corrente e o último frame
float lastFrame = 0.0f;

// Atributos de iluminação
// Foi trocado para a luz vir do centro
// glm::vec3 lightPos(1.2f, 1.0f, 2.0f);
glm::vec3 lightPos(9.0f, 0.0f, 0.0f);

struct Mtl{
	GLfloat *ka;
	GLfloat *kd;
	GLfloat *ks;
	string map_Kd;
};

struct Draw_data {
	GLfloat *vertices;
	GLuint *indices;
	GLfloat *normais;
	GLfloat *texture_vertices;
};

Mtl arrayMtl[6];
Draw_data arrayData[6];

// The MAIN function, from here we start the application and run the game loop
int main()
{
	// Init GLFW
	glfwInit();
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

	// Create a GLFWwindow object that we can use for GLFW's functions
	GLFWwindow* window = glfwCreateWindow(WIDTH, HEIGHT, "Bunny", nullptr, nullptr);
	glfwMakeContextCurrent(window);

	// Set the required callback functions
	//glfwSetKeyCallback(window, key_callback);
	glfwMakeContextCurrent(window);
	glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
	glfwSetCursorPosCallback(window, mouse_callback);
	glfwSetScrollCallback(window, scroll_callback);

	// tell GLFW to capture our mouse
	glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);

	// Set this to true so GLEW knows to use a modern approach to retrieving function pointers and extensions
	glEnable(GL_DEPTH_TEST);
	// Initialize GLEW to setup the OpenGL Function pointers
	glewInit();

	/* get version info */
	const GLubyte* renderer = glGetString(GL_RENDERER); /* get renderer string */
	const GLubyte* version = glGetString(GL_VERSION); /* version as a string */
	cout << "Renderer: " << renderer << endl;
	cout << "OpenGL version supported " << version << endl;

	// Define the viewport dimensions
	int width, height;
	glfwGetFramebufferSize(window, &width, &height);
	glViewport(0, 0, width, height);

	// Build and compile our shader program
	Shader lightingShader("../shaders/lighting.vs", "../shaders/lighting.frag");

	// Build and compile our shader program
	Shader ourShader("../shaders/transformations.vs", "../shaders/transformations.frag");
	Model ourModel("bola.obj");

	//Habilita o z-buffer
	glEnable(GL_DEPTH_TEST);

	// Game loop
	while (!glfwWindowShouldClose(window))
	{
		float currentFrame = glfwGetTime();
		deltaTime = currentFrame - lastFrame;
		lastFrame = currentFrame;
		// input
		// -----
		processInput(window);

		// Check if any events have been activiated (key pressed, mouse moved etc.) and call corresponding response functions
		//glfwPollEvents();

		// Render
		// Clear the colorbuffer
		glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

		// Use cooresponding shader when setting uniforms/drawing objects
		lightingShader.Use();
		GLint objectColorLoc = glGetUniformLocation(lightingShader.Program, "objectColor");
		GLint lightColorLoc = glGetUniformLocation(lightingShader.Program, "lightColor");
		GLint lightPosLoc = glGetUniformLocation(lightingShader.Program, "lightPos");
		GLint viewPosLoc = glGetUniformLocation(lightingShader.Program, "viewPos");
		
		ourShader.Use();
		// Get the uniform locations
		GLint modelLoc = glGetUniformLocation(lightingShader.Program, "model");
		GLint viewLoc = glGetUniformLocation(lightingShader.Program, "view");
		GLint projLoc = glGetUniformLocation(lightingShader.Program, "projection");

		// Pass the matrices to the shader
		glm::mat4 model;
		glm::rotate(glm::mat4(), 0.0f, glm::vec3(0.0f, 1.0f, 0.0f));
		model = glm::translate(model, position);
		model = glm::scale(model, glm::vec3(3.0f, 3.0f, 3.0f));
		glm::mat4 view;
		view = camera.GetViewMatrix();
		glm::mat4 projection = glm::perspective(camera.Zoom, (GLfloat)height / (GLfloat)width, 0.1f, 40.0f);

		glUniformMatrix4fv(modelLoc, 1, GL_FALSE, glm::value_ptr(model));
		glUniformMatrix4fv(viewLoc, 1, GL_FALSE, glm::value_ptr(view));
		glUniformMatrix4fv(projLoc, 1, GL_FALSE, glm::value_ptr(projection));
		ourModel.Draw(ourShader);

		// glfw: swap buffers and poll IO events (keys pressed/released, mouse moved etc.)
		// -------------------------------------------------------------------------------
		glfwSwapBuffers(window);
		glfwPollEvents();
	}

	// glfw: terminate, clearing all previously allocated GLFW resources.
	// ------------------------------------------------------------------
	glfwTerminate();
	return 0;
}

// Is called whenever a key is pressed/released via GLFW
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mode)
{
	if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
		glfwSetWindowShouldClose(window, GL_TRUE);
}

// process all input: query GLFW whether relevant keys are pressed/released this frame and react accordingly
// ---------------------------------------------------------------------------------------------------------
void processInput(GLFWwindow *window)
{
	if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
		glfwSetWindowShouldClose(window, true);
	if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
		camera.ProcessKeyboard(FORWARD, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
		camera.ProcessKeyboard(BACKWARD, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
		camera.ProcessKeyboard(LEFT, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
		camera.ProcessKeyboard(RIGHT, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_P) == GLFW_PRESS) 
		rotateWithp += 0.001;
	if (glfwGetKey(window, GLFW_KEY_O) == GLFW_PRESS)
		rotateWithp -= 0.001;
	if (glfwGetKey(window, GLFW_KEY_8) == GLFW_PRESS) {
		goUp += 0.01f;
		position = glm::vec3(goRightLeft, goUp, goOnZ);
	}
	if (glfwGetKey(window, GLFW_KEY_2) == GLFW_PRESS) {
		goUp -= 0.01f;
		position = glm::vec3(goRightLeft, goUp, goOnZ);
	}
	if (glfwGetKey(window, GLFW_KEY_4) == GLFW_PRESS) {
		goRightLeft -= 0.01f;
		position = glm::vec3(goRightLeft, goUp, goOnZ);
	}
	if (glfwGetKey(window, GLFW_KEY_6) == GLFW_PRESS) {
		goRightLeft += 0.01f;
		position = glm::vec3(goRightLeft, goUp, goOnZ);
	}
	if (glfwGetKey(window, GLFW_KEY_9) == GLFW_PRESS) {
		goOnZ += 0.01f;
		position = glm::vec3(goRightLeft, goUp, goOnZ);
	}
	if (glfwGetKey(window, GLFW_KEY_1) == GLFW_PRESS) {
		goOnZ -= 0.01f;
		position = glm::vec3(goRightLeft, goUp, goOnZ);
	}
}

// glfw: whenever the window size changed (by OS or user resize) this callback function executes
// ---------------------------------------------------------------------------------------------
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
	// make sure the viewport matches the new window dimensions; note that width and 
	// height will be significantly larger than specified on retina displays.
	glViewport(0, 0, width, height);
}


// glfw: whenever the mouse moves, this callback is called
// -------------------------------------------------------
void mouse_callback(GLFWwindow* window, double xpos, double ypos)
{
	if (firstMouse)
	{
		lastX = xpos;
		lastY = ypos;
		firstMouse = false;
	}

	float xoffset = xpos - lastX;
	float yoffset = lastY - ypos; // reversed since y-coordinates go from bottom to top

	lastX = xpos;
	lastY = ypos;

	camera.ProcessMouseMovement(xoffset, yoffset);
}

// glfw: whenever the mouse scroll wheel scrolls, this callback is called
// ----------------------------------------------------------------------
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
	camera.ProcessMouseScroll(yoffset);
}

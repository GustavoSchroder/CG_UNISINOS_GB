#ifndef OBJREADER_H
#define OBJREADER_H

#include <string.h>
#include <fstream>
#include <sstream>
#include "split.h"
#include "estruturas.h"

using namespace std;

class ObjReader {
private:
	char comentarioChar = '#';
	string verticeStringInicial = "v";
	string normalStringInicial = "vn";
	string texturaStringInicial = "vt";
	string faceStringInicial = "f";
	string groupStringInicial = "g";
	string usemtlStringInicial = "usemtl";
	string mtllibStringIncial = "mtllib";

	bool isComentario(vector<string> sLine) {
		return sLine[0][0] == comentarioChar;
	}

	bool isVertice(vector<string> sLine) {
		return sLine[0] == verticeStringInicial;
	}

	bool isNormal(vector<string> sLine) {
		return sLine[0] == normalStringInicial;
	}

	bool isTextura(vector<string> sLine) {
		return sLine[0] == texturaStringInicial;
	}

	bool isMtlLib(vector<string> sLine) {
		return sLine[0] == mtllibStringIncial;
	}

	bool isMaterialRef(vector<string> sLine) {
		return sLine[0] == usemtlStringInicial;
	}

	bool isFace(vector<string> sLine) {
		return sLine[0] == faceStringInicial;
	}

	bool isGroup(vector<string> sLine) {
		return sLine[0] == groupStringInicial;
	}

	Vertex* buildVertex(vector<string> sLine) {
		return new Vertex(atof(sLine[1].c_str()), atof(sLine[2].c_str()), atof(sLine[3].c_str()));
	}

	Vertex* buildIndex(vector<string> sLine) {
		return new Vertex(atof(sLine[1].c_str())-1, atof(sLine[2].c_str())-1, atof(sLine[3].c_str())-1);
	}

	TextureMapping* buildTexture(vector<string> sLine) {
		return new TextureMapping(atof(sLine[1].c_str()), atof(sLine[2].c_str()));
	}

	/*
	Face* buildFace(vector<string> sLine) {
	Face *face = new Face();

	for (string text : sLine) {
	if (text != faceStringInicial) {
	vector<string> vFace = split(text, '/');
	face->getVertex()->push_back(atoi(vFace[0].c_str()) - 1);
	if (vFace.size() > 1) {
	if (!vFace[1].empty()) {
	face->getMappings()->push_back(atoi(vFace[1].c_str()) - 1);
	}
	if (vFace.size() > 2) {
	face->getNormals()->push_back(atoi(vFace[2].c_str()) - 1);
	}
	}
	}
	}
	return face;
	}
	*/


private:
	ObjSpec* buildMesh(ifstream *file) {
		string line;
		Mesh *mesh = new Mesh();
		Group *group = new Group();
		string mtlib = "";
		while (getline(*file, line)) {
			vector<string> sLine = split(line, ' ');
			if (sLine.size() > 0 && !line.empty() && !isComentario(sLine)) {
				if (isVertice(sLine)) {
					mesh->getAllVertex()->push_back(buildVertex(sLine));
					group->getVertex()->push_back(buildVertex(sLine));
					group->setSizeVertex(group->getSizeVertex() + 1);
				}
				else if (isNormal(sLine)) {
					mesh->getAllNormals()->push_back(buildVertex(sLine));
					group->getNormals()->push_back(buildVertex(sLine));
					group->setSizeNormals(group->getSizeNormals() + 1);
				}
				else if (isTextura(sLine)) {
					mesh->getAllMappings()->push_back(buildTexture(sLine));
					group->getMappings()->push_back(buildTexture(sLine));
					group->setSizeMappings(group->getSizeMappings() + 1);
				}
				else if (isFace(sLine)) {
					mesh->getAllIndex()->push_back(buildIndex(sLine));
					group->getIndex()->push_back(buildIndex(sLine));
					group->setSizeIndex(group->getSizeIndex() + 1);
				}
				else if (isGroup(sLine)) {
					cout << sLine[0] << '\n';
					if (group->getName().empty()) {
						group->setName(sLine[1]);
						mesh->setSizeGroups(mesh->getSizeGroups() + 1);
					}
					else {
						mesh->getGroups()->push_back(group);
						group = new Group();
						group->setName(sLine[1]);
						mesh->setSizeGroups(mesh->getSizeGroups() + 1);
					}
				}
				else if (isMaterialRef(sLine)) {
					group->setMaterial(sLine[1]);
				}
				else if (isMtlLib(sLine)) {
					mtlib = sLine[1];
				}
				else {
					//DO NOTHING
				}
			}
		}
		mesh->getGroups()->push_back(group);
		std::cout << "Grupos:" << mesh->getSizeGroups() << '\n';
		std::cout << "Index:" << group->getSizeIndex() << '\n';
		std::cout << "Normais:" << group->getSizeNormals() << '\n';
		std::cout << "Vertices:" << group->getSizeVertex() << '\n';
		std::cout << "Texturas:" << group->getSizeMappings() << '\n';

		ObjSpec *spec = new ObjSpec(mesh, mtlib);
		return spec;
	}

public:
	ObjSpec* readObjFile(string filename) {
		ifstream file(filename);
		if (file.fail()) {
			file.close();
			return 0;
		}
		else {
			ObjSpec *spec = buildMesh(&file);
			if (spec->getMtllibFilename() == "") {
				spec->setMtllibFilename(split(filename, '.')[0] + ".mtl");
			}
			file.close();
			return spec;
		}
	}
};
#endif

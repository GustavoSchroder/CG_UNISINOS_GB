#ifndef MTLREADER_H
#define MTLREADER_H

#include <string.h>
#include <fstream>
#include <sstream>
#include <map>
#include "split.h"
#include "estruturas.h"

using namespace std;

class MltReader {
private:
	char comentarioChar = '#';
	string newmtlStringInicial = "newmtl";
	string kaStringInicial = "Ka";
	string kdStringInicial = "Kd";
	string ksStringInicial = "Ks";
	string nsStringInicial = "Ns";
	string mapKdStringInicial = "map_Kd";

	bool isComentario(vector<string> sLine) {
		return sLine[0][0] == comentarioChar;
	}

	bool isNewMtl(vector<string> sLine) {
		return sLine[0] == newmtlStringInicial;
	}

	bool isKa(vector<string> sLine) {
		return sLine[0] == kaStringInicial;
	}

	bool isKd(vector<string> sLine) {
		return sLine[0] == kdStringInicial;
	}

	bool isKs(vector<string> sLine) {
		return sLine[0] == ksStringInicial;
	}

	bool isNs(vector<string> sLine) {
		return sLine[0] == nsStringInicial;
	}

	bool isMapKd(vector<string> sLine) {
		return sLine[0] == mapKdStringInicial;
	}

	float* buildArray4(vector<string> sLine) {
		float* ar = new float[4];
		ar[0] = atof(sLine[1].c_str());
		ar[1] = atof(sLine[2].c_str());
		ar[2] = atof(sLine[3].c_str());
		if (sLine.size() == 5) {
			ar[3] = atof(sLine[4].c_str());
		}
		else {
			ar[3] = 1.0f;
		}
		return ar;
	}

	void fillMaterialVector(ifstream *file, map<string, Material*> *v) {
		string line;
		Material *material = new Material();
		while (getline(*file, line)) {
			vector<string> sLine = split(line, ' ');
			cout << line << '\n';
			if (sLine.size() > 0 && !line.empty() && !isComentario(sLine)) {
				if (isMapKd(sLine)) {
					material->setMapKd(sLine[1]);
				}
				else if (isNs(sLine)) {
					material->setNs(atof(sLine[1].c_str()));
				}
				else if (isKs(sLine)) {
					material->setKs(buildArray4(sLine));
				}
				else if (isKd(sLine)) {
					material->setKd(buildArray4(sLine));
				}
				else if (isKa(sLine)) {
					material->setKa(buildArray4(sLine));
				}
				else if (isNewMtl(sLine)) {
					if (material->getId().empty()) {
						material->setId(sLine[1]);
					}
					else {
						v->insert(make_pair(material->getId(), material));
						material = new Material();
						material->setId(sLine[1]);
					}
				}
				else {
					//TODO
				}
			}
		}
		v->insert(make_pair(material->getId(), material));
	}

public:
	void readMtlFile(string filename, map<string, Material*> *materials) {
		ifstream file(filename);
		if (!file.fail()) {
			fillMaterialVector(&file, materials);
		}
		file.close();
	}
};

#endif

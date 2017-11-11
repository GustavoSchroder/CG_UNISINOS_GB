#ifndef SPLIT_H
#define SPLIT_H

#include <string.h>
#include <vector>
#include <fstream>
#include <sstream>

using namespace std;

vector<string> split(string str, char delimiter) {
	vector<string> internal;
	stringstream ss(str);
	string tok;
	while (getline(ss, tok, delimiter)) {
		internal.push_back(tok);
	}
	return internal;
}

#endif

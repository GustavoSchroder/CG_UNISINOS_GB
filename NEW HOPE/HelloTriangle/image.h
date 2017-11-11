//Classe Imagem
#ifndef IMAGEM_H
#define IMAGEM_H 

class Image {
public:

	Image(int width, int height) {
		this->width = width;
		this->height = height;
		pixels = new int[width * height];
	}

	~Image(void) {
		delete[] pixels;
	}

	void setRGB(int x, int y, int rgb) {
		pixels[x + y * width] = rgb;
	}

	int getRGB(int x, int y) {
		return pixels[x + y * width];
	}

	int getWidth() {
		return width;
	}

	int getHeight() {
		return height;
	}

	int* getPixels() {
		return pixels;
	}

	void setPixel(int p[]) {
		pixels = p;
	}

	int* subImage(int ox, int oy, int w, int h) {
		int *subPixels = new int[w * h];
		for (int y = 0; y < h; y++) {
			for (int x = 0; x < w; x++) {
				//verifica se esta dentro dos limites da imagem
				if (x + ox + (y + oy) * width < width * height)
					subPixels[x + y * w] = pixels[x + ox + (y + oy) * width];
				else
					subPixels[x + y * w] = 16711935; //magenta
			}
		}
		return subPixels;
	}

private:
	int width, height;
	int *pixels;
};

#endif

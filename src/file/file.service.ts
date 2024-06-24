import { Injectable } from '@nestjs/common';
import axios from 'axios';
import NodeCache from 'node-cache';

const apiUrl = 'https://rest-test-eight.vercel.app/api/test';

@Injectable()
export class FileService {
  private cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

  public transformData(data: { fileUrl: string }[]): any {
    const result: any = {};

    data.forEach(({ fileUrl }) => {
      const urlObj = new URL(fileUrl);
      const ip = urlObj.hostname;
      const pathParts = urlObj.pathname.split('/').filter((pp) => pp != '');

      let currentLevel = (result[ip] = result[ip] || []);

      pathParts.forEach((part, index) => {
        const decodedPart = decodeURIComponent(part);

        const isFileName =
          index === pathParts.length - 1 && decodedPart.includes('.');

        if (isFileName) {
          currentLevel.push(decodedPart);
          return;
        }

        let existingFolder = currentLevel.find(
          (cl: any) =>
            typeof cl === 'object' && Object.keys(cl)[0] === decodedPart,
        );

        if (!existingFolder) {
          existingFolder = { [decodedPart]: [] };
          currentLevel.push(existingFolder);
        }

        currentLevel = existingFolder[decodedPart];
      });
    });

    return result;
  }

  async getFilesData(): Promise<any> {
    const cacheKey = 'filesData';
    const cachedData = this.cache.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get(apiUrl);

      if (
        !response.data ||
        !response.data.items ||
        !Array.isArray(response.data.items)
      ) {
        throw new Error('Invalid response structure');
      }

      const transformedData = this.transformData(response.data.items);
      this.cache.set(cacheKey, transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error('Error fetching data');
    }
  }
}

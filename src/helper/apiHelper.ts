// helper/apiHelper.ts
import axios from 'axios';

const API = {

  async postGcheckChat(url: string, messages: string, params?: any) {
    const response = await axios.post(url, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: {
        messages: messages,
        params
      }
    });

    return response.data;
  },
  
  async postGrammarChecker(url: string, text: string) {
    const response = await axios.post(url, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: {
        text: text
      }
    });

    return response.data;
  },
  

  async postWithAudio(url: string, formData: FormData) {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async get(url: string, params?: any) {
    const response = await axios.get(url, { params });
    return response.data;
  },
};

export default API;
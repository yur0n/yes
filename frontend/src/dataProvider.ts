import jsonServerProvider from "ra-data-json-server";
import { DataProvider } from "ra-core";
const apiUrl = import.meta.env.VITE_JSON_SERVER_URL;
import { fetchUtils } from "react-admin";

interface Users {
  data: {
    userId: string;
    chatId: string;
  }[];
  message: string;
}

interface SendMessageResponse {
  status: string;
  ok: boolean;
  result: { delivered: boolean; id: string }[];
}

export interface CustomDataProvider extends DataProvider {
  sendMessage: (
    resource: string,
    params: Users
  ) => Promise<SendMessageResponse>;
}

const originalDataProvider = jsonServerProvider(apiUrl) as CustomDataProvider;

export const dataProvider: CustomDataProvider = {
  ...originalDataProvider,
  sendMessage: async (resource, params) => {
    return fetchUtils
      .fetchJson(`${apiUrl}/${resource}`, {
        method: "POST",
        body: JSON.stringify(params),
      })
      .then(({ json }) => json);
  },
};

import axiosJWT from "./axiosJWT";

export const createKeluarApi = (data) => {
    return axiosJWT.post("/api/v1/keluar", data);
};

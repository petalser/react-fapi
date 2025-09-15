import { privateAxios } from "../api/axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export const usePrivateAxios = () => {
    const navigate = useNavigate();
    const { token, updateToken } = useAuth();

    useEffect(() => {
        const reqInterceptor = privateAxios.interceptors.request.use(
            (config) => {
                if (token && !config.headers["Authorization"]) {
                    config.headers["Authorization"] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const resInterceptor = privateAxios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    updateToken("")
                    navigate("/login", { replace: true });
                }
                return Promise.reject(error);
            }
        );

        return () => {
            privateAxios.interceptors.request.eject(reqInterceptor);
            privateAxios.interceptors.response.eject(resInterceptor);
        };
    }, [navigate]);

    return privateAxios;
};

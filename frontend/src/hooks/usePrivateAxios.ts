import { privateAxios } from "../api/axios";
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setToken, clearToken } from "../features/authSlice";

export const usePrivateAxios = () => {
    const tokenSignal = useSelector((state) => state.auth);
    const isRefresh = useRef(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const reqInterceptor = privateAxios.interceptors.request.use(
            (config) => {
                if (!config.headers["Authorization"]) {
                    config.headers["Authorization"] = `Bearer ${tokenSignal}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const resInterceptor = privateAxios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const request = error.config;
                if (error.response?.status === 403 && !isRefresh.current) {
                    isRefresh.current = true;

                    const newAccessToken = await privateAxios
                        .get("/auth/refresh")
                        .then((res) => res.data.accessToken);
                    request.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    dispatch(setToken(newAccessToken));
                    return privateAxios(request);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            privateAxios.interceptors.request.eject(reqInterceptor);
            privateAxios.interceptors.response.eject(resInterceptor);
        };
    }, [tokenSignal, dispatch]);

    return privateAxios;
};
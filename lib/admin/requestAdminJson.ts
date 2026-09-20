import { requestJson } from '@/lib/api/requestJson';
import { protectAdminMutation } from './protectAdminMutation';

/** Admin APIs share JSON handling and protect every in-flight write, including immediate controls. */
export function requestAdminJson<ResponseBody>(url: string, options?: RequestInit, failureMessage = 'Admin request failed'): Promise<ResponseBody> {
    const request = () => requestJson<ResponseBody>(url, options, failureMessage);
    const method = options?.method?.toUpperCase() ?? 'GET';
    return method === 'GET' || method === 'HEAD' ? request() : protectAdminMutation(request);
}

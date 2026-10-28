/**
 * The environment-backed superadmin, which cannot be replaced by a delegated database account
 */
export const ADMIN_USERNAME = 'admin';

/**
 * Cookie in which the browser of a signed in administrator carries the session
 */
export const ADMIN_SESSION_COOKIE_NAME = 'admin_session';

/**
 * How long one sign in lasts before the administration asks for the credentials again
 */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Fields of the login form, read from it by the endpoint which opens the session
 */
export const ADMIN_USERNAME_FIELD_NAME = 'username';
export const ADMIN_PASSWORD_FIELD_NAME = 'password';
export const ADMIN_REDIRECT_PATH_FIELD_NAME = 'redirectPath';

/**
 * Query parameter through which the login page learns which page was asked for before the sign in
 */
export const ADMIN_REDIRECT_PATH_QUERY_PARAMETER = ADMIN_REDIRECT_PATH_FIELD_NAME;

/**
 * Query parameter through which a refused sign in is reported back to the login page
 */
export const ADMIN_LOGIN_ERROR_QUERY_PARAMETER = 'error';
export const ADMIN_INVALID_CREDENTIALS_ERROR = 'invalid-credentials';

/**
 * The pages of the administration which have no feature module of their own to name them
 */
export const ADMIN_DASHBOARD_PATH = '/admin';
export const ADMIN_LOGIN_PATH = '/admin/login';
export const ADMIN_WORKSHOPS_PATH = '/admin/workshops';
export const ADMIN_CONTACTS_PATH = '/admin/contacts';
export const ADMIN_DISCOUNT_CODES_PATH = '/admin/discount-codes';

/**
 * The endpoints which open and close the session of an administrator
 */
export const ADMIN_SESSION_API_PATH = '/api/admin/session';
export const ADMIN_SIGN_OUT_API_PATH = '/api/admin/session/sign-out';

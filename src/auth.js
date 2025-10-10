const LOCAL_USER_STORAGE_KEY = 'catalogoLocalUsers';
const LOCAL_SESSION_STORAGE_KEY = 'catalogoLocalSession';

const formSelectors = {
    login: {
        form: '#loginForm',
        message: '[data-feedback-for="login"]',
        submit: '#loginForm .form-submit'
    },
    register: {
        form: '#registerForm',
        message: '[data-feedback-for="register"]',
        submit: '#registerForm .form-submit'
    }
};

function getStorage() {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
        }
    } catch (error) {
        console.warn('No se puede acceder a localStorage:', error);
    }
    return null;
}

function readStorageJson(key, fallback) {
    const storage = getStorage();
    if (!storage) return fallback;

    try {
        const raw = storage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch (error) {
        console.warn(`No se pudo leer la clave ${key} de localStorage:`, error);
        return fallback;
    }
}

function writeStorageJson(key, value) {
    const storage = getStorage();
    if (!storage) return false;

    try {
        storage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`No se pudo guardar la clave ${key} en localStorage:`, error);
        return false;
    }
}

function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

async function hashPassword(password) {
    try {
        if (typeof window !== 'undefined' && window.crypto?.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            return `sha256:${bufferToHex(hashBuffer)}`;
        }
    } catch (error) {
        console.warn('No se pudo generar el hash de la contraseña:', error);
    }

    return `plain:${password}`;
}

function generateLocalId() {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
        return `local-${window.crypto.randomUUID()}`;
    }

    return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getLocalUsers() {
    const users = readStorageJson(LOCAL_USER_STORAGE_KEY, []);
    if (!Array.isArray(users)) {
        return [];
    }

    return users
        .map((user) => {
            if (!user || typeof user !== 'object') return null;
            if (!user.email || !user.passwordHash) return null;
            return {
                id: user.id || generateLocalId(),
                email: String(user.email).trim(),
                passwordHash: String(user.passwordHash),
                createdAt: user.createdAt || new Date().toISOString()
            };
        })
        .filter(Boolean);
}

function saveLocalUsers(users) {
    return writeStorageJson(LOCAL_USER_STORAGE_KEY, users);
}

async function createLocalUserAccount(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
        return { error: 'El correo es obligatorio.' };
    }

    const users = getLocalUsers();
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
        return { error: 'Ya existe una cuenta local con este correo.' };
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
        id: generateLocalId(),
        email: normalizedEmail,
        passwordHash,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    if (!saveLocalUsers(users)) {
        return { error: 'No se pudo guardar la cuenta local.' };
    }

    const session = createLocalSession(newUser);
    return { user: newUser, session };
}

async function authenticateLocalUser(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
        return { error: 'El correo es obligatorio.' };
    }

    const users = getLocalUsers();
    const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (!user) {
        return { error: 'No existe una cuenta local con este correo.' };
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.passwordHash && `plain:${password}` !== user.passwordHash) {
        return { error: 'La contraseña no es válida.' };
    }

    const session = createLocalSession(user);
    return { user, session };
}

function isNetworkError(error) {
    if (!error) return false;

    if (error instanceof TypeError) {
        return true;
    }

    if (typeof error.status === 'number' && error.status === 0) {
        return true;
    }

    const message = String(error.message ?? error.error_description ?? '').toLowerCase();
    if (!message) return false;

    return (
        message.includes('fetch') ||
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('dns') ||
        message.includes('offline')
    );
}

function normalizeSessionUser(user) {
    const createdAt = user.createdAt || user.created_at || new Date().toISOString();
    return {
        id: user.id || generateLocalId(),
        email: String(user.email ?? '').trim(),
        app_metadata: { provider: 'local' },
        user_metadata: { localAccount: true },
        aud: 'authenticated',
        created_at: createdAt
    };
}

function createLocalSession(user) {
    const session = {
        access_token: null,
        expires_at: null,
        token_type: 'local',
        user: normalizeSessionUser(user),
        provider_token: null,
        isLocalSession: true
    };

    writeStorageJson(LOCAL_SESSION_STORAGE_KEY, session);
    return session;
}

export function getStoredLocalSession() {
    const session = readStorageJson(LOCAL_SESSION_STORAGE_KEY, null);
    if (!session || typeof session !== 'object') {
        return null;
    }

    if (!session.user?.email) {
        return null;
    }

    session.isLocalSession = true;
    session.user = normalizeSessionUser(session.user);
    return session;
}

export function clearStoredLocalSession() {
    const storage = getStorage();
    storage?.removeItem(LOCAL_SESSION_STORAGE_KEY);
}

function setMessage(target, text, type = 'neutral') {
    const messageEl = document.querySelector(formSelectors[target].message);
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.classList.remove('error', 'success');

    if (type === 'error') {
        messageEl.classList.add('error');
    } else if (type === 'success') {
        messageEl.classList.add('success');
    }
}

function setLoading(target, isLoading) {
    const submitButton = document.querySelector(formSelectors[target].submit);
    if (!submitButton) return;

    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? 'Procesando…' : submitButton.dataset.defaultLabel || submitButton.defaultLabel || submitButton.textContent;
}

function persistButtonLabels() {
    Object.values(formSelectors).forEach(({ submit }) => {
        const btn = document.querySelector(submit);
        if (btn && !btn.dataset.defaultLabel) {
            btn.dataset.defaultLabel = btn.textContent;
        }
    });
}

function setupTabNavigation() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.target;
            tabs.forEach((btn) => btn.classList.toggle('active', btn === tab));
            forms.forEach((form) => form.classList.toggle('hidden', form.id !== targetId));
        });
    });
}

export function initAuth({ supabase, onLoginSuccess } = {}) {
    if (!supabase) {
        throw new Error('Se requiere una instancia de Supabase para iniciar la autenticación.');
    }

    persistButtonLabels();
    setupTabNavigation();

    const loginForm = document.querySelector(formSelectors.login.form);
    const registerForm = document.querySelector(formSelectors.register.form);

    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        setMessage('login', 'Ingresando…');
        setLoading('login', true);

        const email = event.currentTarget.email.value.trim();
        const password = event.currentTarget.password.value;

        let data = null;
        let error = null;

        try {
            const response = await supabase.auth.signInWithPassword({ email, password });
            data = response.data;
            error = response.error;
        } catch (signInError) {
            error = signInError;
        }

        if (error) {
            const localResult = await authenticateLocalUser(email, password);

            if (localResult?.session) {
                setMessage('login', 'Inicio de sesión exitoso (modo sin conexión).', 'success');
                if (typeof onLoginSuccess === 'function') {
                    await onLoginSuccess(localResult.session);
                }
            } else if (isNetworkError(error)) {
                setMessage(
                    'login',
                    'No hay conexión con Supabase y no se encontró una cuenta local para este correo.',
                    'error'
                );
            } else {
                setMessage('login', error.message ?? 'No se pudo iniciar sesión.', 'error');
            }
        } else if (data?.session) {
            clearStoredLocalSession();
            setMessage('login', 'Inicio de sesión exitoso. ¡Bienvenido!', 'success');
            if (typeof onLoginSuccess === 'function') {
                await onLoginSuccess(data.session);
            }
        } else {
            setMessage('login', 'Revisa tu correo para continuar.', 'success');
        }

        setLoading('login', false);
    });

    registerForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        setMessage('register', 'Creando tu cuenta…');
        setLoading('register', true);

        const email = event.currentTarget.email.value.trim();
        const password = event.currentTarget.password.value;
        const passwordConfirm = event.currentTarget.passwordConfirm.value;

        if (password !== passwordConfirm) {
            setMessage('register', 'Las contraseñas no coinciden.', 'error');
            setLoading('register', false);
            return;
        }

        let data = null;
        let error = null;

        try {
            const response = await supabase.auth.signUp({ email, password });
            data = response.data;
            error = response.error;
        } catch (signUpError) {
            error = signUpError;
        }

        if (error) {
            if (isNetworkError(error)) {
                const fallback = await createLocalUserAccount(email, password);

                if (fallback?.session) {
                    setMessage(
                        'register',
                        'Cuenta creada en modo local. Puedes iniciar sesión incluso sin conexión.',
                        'success'
                    );
                    registerForm.reset();
                    if (typeof onLoginSuccess === 'function') {
                        await onLoginSuccess(fallback.session);
                    }
                } else {
                    setMessage(
                        'register',
                        fallback?.error ?? 'No se pudo crear la cuenta local.',
                        'error'
                    );
                }
            } else {
                setMessage('register', error.message ?? 'No se pudo crear la cuenta.', 'error');
            }
        } else if (data?.user) {
            clearStoredLocalSession();
            const requiresConfirmation = data.user.confirmation_sent_at !== null;
            const successMessage = requiresConfirmation
                ? 'Cuenta creada. Revisa tu correo para confirmar.'
                : 'Cuenta creada y sesión iniciada. ¡Bienvenido!';
            setMessage('register', successMessage, 'success');
            registerForm.reset();
            if (!requiresConfirmation && data.session && typeof onLoginSuccess === 'function') {
                await onLoginSuccess(data.session);
            }
        } else {
            setMessage('register', 'Cuenta creada. Revisa tu correo para continuar.', 'success');
        }

        setLoading('register', false);
    });
}

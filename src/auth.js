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

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setMessage('login', error.message ?? 'No se pudo iniciar sesión.', 'error');
        } else if (data?.session) {
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

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            setMessage('register', error.message ?? 'No se pudo crear la cuenta.', 'error');
        } else if (data?.user) {
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

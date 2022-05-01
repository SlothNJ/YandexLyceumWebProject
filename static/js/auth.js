var username = '';

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

function verify_data(data, type) {
    const symbols = 'qwertyuiopasdfghjklzxcvbnm0123456789_-'
    const email_symbols = symbols + '.@'
    const password_symbols = symbols + '.@!#$%^&*(),/'
    if (data.length < 64 && data != '') {
        if (type == 'email') {
            for (var i = 0; i < data.length; i++) {
                if (!email_symbols.includes(data[i])) { return false; };
            }
            if (!data.includes('@')) { return false; };
        }
        else if (type == 'username') {
            for (var i = 0; i < data.length; i++) {
                if (!symbols.includes(data[i])) { return false; };
            }
        }
        else if (type == 'password') {
            for (var i = 0; i < data.length; i++) {
                if (!password_symbols.includes(data[i])) { return false; };
            };
        };
        return true;
    }
    return false;
}

function login_page(error = '', email = '') {
    document.title = 'Вход';
    window.history.pushState('', "Вход", "/login/");
    header.innerHTML = `
    <a onclick="register_page()">Регистрация</a>`
    content_container.innerHTML = `
    <div class="auth-form">
    <input name="email" required placeholder="Адрес почты" value="${email}">
    <input name="password" required placeholder="Пароль" type="password">
    <button onclick="login()">Войти</button>
    <div class="form-error">${error}</div>
    </div>`;
}

function register_page(error = '', name = '') {
    document.title = 'Регистрация';
    window.history.pushState('', "Регистрация", "/register/");
    header.innerHTML = `
    <a onclick="login_page()">Вход</a>`
    content_container.innerHTML = `
    <div class="auth-form">
    <input name="username" required placeholder="Имя пользователя" value="${name}">
    <input name="email" required placeholder="Почта">
    <input name="password" required placeholder="Пароль" type="password">
    <button onclick="register()">Зарегистрироваться</button>
    <div class="form-error">${error}</div>
    </div>`;
}

function login() {
    if (username === '') {
        let email = document.getElementsByName('email')[0].value;
        let password = document.getElementsByName('password')[0].value;
        if (verify_data(email, 'email') && verify_data(password, 'password')) {
            fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            }).then((res) => {
                res.json().then((data) => {
                    if (data['message'] !== undefined) { login_page('Неверный логин или пароль', email) }
                    else {
                        username = parseJwt(data['token'])['name'];
                        index_page();
                    };
                });
            });
        }
        else {
            login_page('Недопустимые данные', email)
        }
    }
}

function register() {
    if (username === '') {
        let name = document.getElementsByName('username')[0].value;
        let email = document.getElementsByName('email')[0].value;
        let password = document.getElementsByName('password')[0].value;
        if (verify_data(name, 'username') && verify_data(email, 'email') && verify_data(password, 'password')) {
            let name = document.getElementsByName('username')[0].value
            fetch(`${String(window.origin).split('/').slice(0, 3).join('/')}/api/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({
                    username: name,
                    email: email,
                    password: password
                }),
            }).then((res) => {
                res.json().then((data) => {
                    if (data['message'] !== undefined) { register_page('Пользователь с таким адресом электронной почты уже существует', name) }
                    else {
                        username = parseJwt(data['token'])['name'];
                        index_page();
                    };
                });
            });
        }
        else {
            register_page('Недопустимые данные', name)
        }
    }
}

function logout() {
    username = '';
    index_page();
}
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
const porta = 3000;
const host = '0.0.0.0';
const user_list = [];
const messages = [];

function user_process_cad(req, res) {
    const user_dados_ = req.body;
    let sys_resp_scrn = '';

    if (!(user_dados_.nome && user_dados_.data && user_dados_.usuario )) {
        sys_resp_scrn = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" type="text/css" href="cadastroStyle.css">
            <title>Cadastro</title>
        </head>
        <body>
            <div id="cad_box">
                <form action="/cadastro.html" method="POST">
        
                    <h3>FORMULÁRIO DE CADASTRO</h3>
                    <label class="label" for="nome">Digite o Nome:</label>
                    <input type="text" id="nome" name="nome" placeholder="Digite o Nome" value="${user_dados_.nome}" required>
        `;
        if (!user_dados_.nome) {
            sys_resp_scrn += `
                    <p class="ERROR_">O campo Nome é obrigatório!</p>
            `;
        }
        sys_resp_scrn += `
                    <label class="label" for="data">Digite a Data de nascimento:</label>
                        <input type="text" id="data" name="data" placeholder="Digite a Data de Nascimento" value="${user_dados_.data}" required>
        `;
        if (!user_dados_.data) {
            sys_resp_scrn += `
                    <p class="ERROR_">O campo data é obrigatório!</p>
            `;
        }
        sys_resp_scrn += `
                    <label class="label" for="usuario">Digite o Nome de Usuario:</label>
                        <input type="text" id="usuario" name="usuario" placeholder="Digite o Nome de Usuário" value="${user_dados_.usuario}" required>
        `;   
        if (!user_dados_.usuario) {
            sys_resp_scrn += `
                    <p class="ERROR_">O campo Nome de Usuário é obrigatório!</p>
            `;
        }
        sys_resp_scrn += `
                    <br>
                    <button id="cadastroBTN" type="submit">Cadastrar!</button>
    
                </form>
            </div>
        </body>
        </html>
        `;
        
        return res.end(sys_resp_scrn);
} 
else {
        const usu = {
            nome: user_dados_.nome,
            data: user_dados_.data,
            usuario: user_dados_.usuario,
        }

        user_list.push(usu);

        sys_resp_scrn = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastrados</title>
            <link rel="stylesheet" href="jaCadastradosStyle.css">
        </head>
        <body>
            <h3>Usuários já Cadastrados:</h3><br>
                <table>
                    <thead>
                        <tr>
                            <th class="label">Nome</th>
                            <th class="label">Nome de Usuário</th>
                            <th class="label">Data de Aniversario</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        for (const usu of user_list) {
            sys_resp_scrn += `
                          <tr>
                            <td id="caixa">${usu.nome}</td>
                            <td id="caixa">${usu.usuario}</td>
                            <td id="caixa">${usu.data}</td>
                        </tr>
                    `;
        }

        sys_resp_scrn += `
                    </tbody>
                </table><br>
            <a href="/"><button>Menu</button></a>
            <a href="/cadastro.html"><button>Cadastro</button></a> 
            <a href="/WEBCHAT.html"><button>WEBCHAT</button></a> 
            <a href="/login.html"><button>Logout</button></a> 
        </body>
        </html>
                `;

        return res.end(sys_resp_scrn);

    }
}

function check_user_(req, res, next) {
    if (req.session.checked_user_) {
        next();
    } else {
        res.redirect("/login.html");
    }
}

const app = express();

app.use(cookieParser());
app.use(session({
    secret: "myscrtky",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30,
    }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), './paginas')));
app.get('/', check_user_, (req, res) => {
    const last_ac_user_ = req.cookies.acess_usu_ult;
    const data = new Date();
    res.cookie("acess_usu_ult", data.toLocaleString(), {
        maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true    
    });
    return res.end(`
        <!DOCTYPE html>
        <html lang="pt-BR">
            <head>
                <meta charset="UTF-8>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" type="text/css" href="menuStyle.css">
                <title>Menu</title>
                
            </head>
            <body>
                <h1>Menu</h1>
                <a href="/cadastro.html">Cadastrar Usuario(s)</a>
                <a href="/WEBCHAT.html">WEBCHAT</a>
                <a href="/login.html">Logout</a>
            </body>
            <footer>
                <p>Ultimo Acesso: ${last_ac_user_}</p>
            </footer>
        </html>        
    `)
});
app.get('/cadastro.html', check_user_, (req, res) => {
    res.sendFile(path.join(process.cwd(), './paginas/cadastro.html'));
});
app.post('/cadastro.html', check_user_, user_process_cad);
app.post('/login', (req, res) => {
    const usuario = req.body.usuario;
    const senha = req.body.senha;
    console.log("Usuario:", usuario, "Senha:", senha); 
    if (usuario && senha && usuario === 'João' && senha === '2302') {
        req.session.checked_user_ = true;
        res.redirect('/');
    } 
    else {
        console.log("Login falhou. Usuário e(ou) senha incorretos."); 
        res.end(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>ERROR</title>
                <link rel="stylesheet" type="text/css" href="ERROR.css">
            </head>
            <body>
                <h1>Usuario ou senha invalidos</h1><br>
                <a href="/login.html">Tentar Novamente</a>
            </body>
            </html>
        `)
    }
});
app.get('/get-usuarios', (req, res) => {
    res.json({ usuarios: user_list });
});
function getCurrentTimestamp() {
    return new Date().toLocaleString();
}
app.post('/enviar-mensagem', check_user_, (req, res) => {
    const usuario = req.body.usuario;
    const mensagem = req.body.mensagem;

    if (usuario && mensagem) {
        const timestamp = getCurrentTimestamp();
        const novaMensagem = { usuario, mensagem, timestamp };
        messages.push(novaMensagem);
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, error: 'Usuário e mensagem são obrigatórios' });
    }
});
app.get('/get-mensagens', check_user_, (req, res) => {
    res.json(messages);
});
app.listen(porta, host, () => {
    console.log(`Servidor rodando na url http://localhost:3000`);
});
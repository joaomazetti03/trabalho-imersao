import express, { Request, Response } from "express";
import mysql from "mysql2/promise";

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Página inicial (requisito estático)
app.get('/', (req: Request, res: Response) => {
    return res.render('index');
});

// Listagem de usuários
app.get('/users', async (req: Request, res: Response) => {
    const [rows] = await connection.query("SELECT * FROM users");
    res.render('users/index', { users: rows });
});

// Formulário para adicionar usuário
app.get('/users/add', (req: Request, res: Response) => {
    res.render('users/add');
});

// Inserir novo usuário
app.post('/users', async (req: Request, res: Response) => {
    const { nome, email, senha, papel } = req.body;
    const ativo = req.body.ativo ? 1 : 0; // Converte 'on' para 1 e ausente para 0
    const insertQuery = "INSERT INTO users (nome, email, senha, papel, ativo) VALUES (?, ?, ?, ?, ?)";
    await connection.query(insertQuery, [nome, email, senha, papel, ativo]);
    res.redirect('/users');
});

// Formulário para editar usuário
app.get('/users/edit/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
        const [rows]: any = await connection.query('SELECT * FROM users WHERE id = ?', [id]);

        if (Array.isArray(rows) && rows.length > 0) {
            res.render('users/edit', { user: rows[0] });
        } else {
            res.redirect('/users');
        }
    } catch (error) {
        console.error('Erro ao buscar o usuário:', error);
        res.redirect('/users');
    }
});

// Editar um usuário
app.post('/users/edit/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, email, senha, papel } = req.body;
    const ativo = req.body.ativo ? 1 : 0; // Converte 'on' para 1 e ausente para 0

    try {
        const updateQuery = 'UPDATE users SET nome = ?, email = ?, senha = ?, papel = ?, ativo = ? WHERE id = ?';
        await connection.query(updateQuery, [nome, email, senha, papel, ativo, id]);

        res.redirect('/users');
    } catch (error) {
        console.error('Erro ao atualizar o usuário:', error);
        res.redirect('/users');
    }
});

// Excluir usuário
app.post('/users/:id/delete', async (req: Request, res: Response) => {
    const id = req.params.id;
    await connection.query("DELETE FROM users WHERE id = ?", [id]);
    res.redirect('/users');
});

// Página de login
app.get('/login', (req: Request, res: Response) => {
    res.render('login');
});

// Autenticação de login
app.post('/login', async (req: Request, res: Response) => {
    const { email, senha } = req.body;
    const [rows]: any = await connection.query("SELECT * FROM users WHERE email = ? AND senha = ?", [email, senha]);
    
    if (rows.length > 0) {
        res.redirect('/users');
    } else {
        res.redirect('/login');
    }
});

app.listen(3000, () => console.log("Server is running on port 3000"));

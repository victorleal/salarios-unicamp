require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect('mongodb://'
                        + process.env.DB_USER + ':' + process.env.DB_PASSWORD +
                        '@' + process.env.DB_HOST + '/' + process.env.DB_NAME);
                        
let db = mongoose.connection;

db.on('error', function(err) {
    console.log(err);
    return;
});

db.once('open', function() {
    console.log("conexao aberta com o mongo");
});

const Schema = mongoose.Schema;

const FuncionarioSchema = new Schema({
    matricula: {type:Number},
    nome: {type:String}
});

const SalarioSchema = new Schema({
    matricula: {type:Number},
    mes: {type:Number},
    ano: {type:Number},
    remuneracao_bruta: {type:Number},
    remuneracao_liquida: {type:Number}
});

const Funcionario = mongoose.model('Funcionario', FuncionarioSchema, 'funcionarios');
const Salario = mongoose.model('Salario', SalarioSchema, 'salarios');

module.exports = {
    funcionario: Funcionario,
    salario: Salario
}

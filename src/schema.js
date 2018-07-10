const _ = require('lodash');
const db = require('./database.js');

/* Here a simple schema is constructed without using the GraphQL query language.
  e.g. using 'new GraphQLObjectType' to create an object type
*/

let {
    // These are the basic GraphQL types needed
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLList,
    GraphQLObjectType,
    // This is used to create required fields and arguments
    GraphQLNonNull,
    // This is the class we need to create the schema
    GraphQLSchema,
} = require('graphql');

const SalarioType = new GraphQLObjectType({
    name: 'Salario',
    description: 'Representa um salario de um funcionario UNICAMP',
    fields: () => ({
        mes: {type: new GraphQLNonNull(GraphQLInt)},
        ano: {type: new GraphQLNonNull(GraphQLInt)},
        remuneracao_bruta: {type: new GraphQLNonNull(GraphQLFloat)},
        remuneracao_liquida: {type: new GraphQLNonNull(GraphQLFloat)},
    })
});

const FuncionarioType = new GraphQLObjectType({
    name: "Funcionario",
    description: 'Representa um funcionário UNICAMP',
    fields: () => ({
        matricula: {type: new GraphQLNonNull(GraphQLInt)},
        nome: {type: new GraphQLNonNull(GraphQLString)},
        salario: {
            type: new GraphQLList(SalarioType),
            args: {
                mes: {
                    type: GraphQLInt,
                    description: "Mes do Salário."
                },

                ano: {
                    type: GraphQLInt,
                    description: "Ano."
                }
            },
            resolve: (funcionario, {mes, ano}) => {

                var salario = new Promise((resolve, reject) => {
                    query = db.salario.find({funcionario_id: funcionario.matricula, mes: mes, ano: ano});

                    query.exec((err, funcionarios) => {
                        err ? reject(err) : resolve(funcionarios)
                    });
                });

                return salario;
            }
        },

        salarios: {
            type: new GraphQLList(SalarioType),
            resolve: (funcionario) => {

                var salarios = new Promise((resolve, reject) => {
                    query = db.salario.find({funcionario_id: funcionario.matricula});

                    query.exec((err, funcionarios) => {
                        err ? reject(err) : resolve(funcionarios)
                    });
                });

                return salarios;
            }
        }
    })
});

const SalariosUnicampQueryRootType = new GraphQLObjectType({
    name: 'SalariosUnicampSchema',
    description: "Salários UNICAMP Schema Query Root",
    fields: () => ({

        funcionario: {
            type: new GraphQLList(FuncionarioType),
            description: "Retorna um funcionário UNICAMP com base na matrícula",

            args: {
                matricula: {
                    type: GraphQLInt,
                    description: "Matrícula do Funcionário"
                }
            },

            resolve: (root, {matricula}) => {

                var funcionario = new Promise((resolve, reject) => {
                    query = db.funcionario.find({matricula: matricula});

                    query.exec((err, funcionarios) => {
                        err ? reject(err) : resolve(funcionarios)
                    });
                });

                return funcionario;
            }
        },

        funcionario_nome: {
            type: new GraphQLList(FuncionarioType),
            description: "Retorna um funcionário UNICAMP com base no nome",

            args: {
                nome: {
                    type: GraphQLString,
                    description: "Nome do Funcionário"
                }
            },

            resolve: (root, {nome}) => {

                var funcionario = new Promise((resolve, reject) => {
                    query = db.funcionario.find({nome: new RegExp(nome.toUpperCase(), "i")});

                    query.exec((err, funcionarios) => {
                        err ? reject(err) : resolve(funcionarios)
                    });
                });

                return funcionario;
            }
        },

        funcionarios: {
            type: new GraphQLList(FuncionarioType),
            description: "Lista de todos os funcionários",

            args: {
                first: {
                    type: GraphQLInt,
                    description: "Limits the number of results returned in the page. Defaults to 10."
                },

                skip: {
                    type: GraphQLInt,
                    description: "Integer offset."
                }
            },

            resolve: (root, {first = 10, skip }) => {

                var funcionarios = new Promise((resolve, reject) => {
                    query = db.funcionario.find().limit(first);

                    if (skip) {
                        query.skip(skip);
                    }

                    query.exec((err, funcionarios) => {
                        err ? reject(err) : resolve(funcionarios)
                    });
                });

                return funcionarios;
            }
        }
    })
});

// This is the schema declaration
const SalariosUnicampAppSchema = new GraphQLSchema({
    query: SalariosUnicampQueryRootType
    // If you need to create or updata a datasource,
    // you use mutations. Note:
    // mutations will not be explored in this post.
    // mutation: BlogMutationRootType
});

module.exports = SalariosUnicampAppSchema;

const fetch = require('node-fetch');
const fs = require('fs');

async function getStates(){
  const states = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados/");
  return await states.json();
}

async function getStateCities(sigla){
  const cities = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${sigla}/municipios`);
  return await cities.json()
}

async function generateCitiesSQL(){
  const states = await getStates();
  let insertCitySQL = "";
  for(let i = 1; i < states.length; i++){
    const cities = await getStateCities(states[i].sigla);
    cities.forEach(city => {
      insertCitySQL += `insert into cidade(nome, estadoId) values("${city.nome}", ${i});\n`;
    });
  }
  return insertCitySQL;
}

async function generateStatesSQL(){
  states = await getStates();
  let insertStatesSQL = "";
  states.forEach((state, index) => {
    insertStatesSQL += `insert into estado(id, sigla, nome) values(${index+1}, "${state.sigla}", "${state.nome}");\n`;
  });
  return insertStatesSQL;
}

async function writeSqlToFile(fileName){
  const statesSQL = await generateStatesSQL();
  const citiesSQL = await generateCitiesSQL();
  fs.writeFile(fileName, statesSQL + citiesSQL, (err) => {
    if (err) console.log(err);
    console.log("SQLs salvos no arquivo " + fileName);
  });
}

writeSqlToFile("cidade_estados.sql");

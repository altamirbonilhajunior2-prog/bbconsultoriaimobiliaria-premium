import assert from "node:assert/strict";
import test from "node:test";
import {Prisma} from "../generated/prisma/client";
import {similarPropertyWhere,closestSimilarProperties} from "./similar-properties";
const source={code:"BBA023",propertyType:"APARTAMENTO" as const,category:"Padrão",city:"São José dos Campos",state:"SP",purpose:"VENDA" as const,bedrooms:2,suites:1,price:new Prisma.Decimal(740000),rentalPrice:null};
test("BBA023 exige perfil exato, disponibilidade e faixa relativa de preço",()=>{
  const where=similarPropertyWhere(source)!;
  assert.deepEqual(where.price,{gte:592000,lte:888000});
  assert.equal(where.bedrooms,2);assert.equal(where.suites,1);
  assert.equal(where.published,true);assert.equal(where.status,"DISPONIVEL");
  assert.deepEqual(where.city,{equals:source.city,mode:"insensitive"});
  assert.deepEqual(where.code,{not:"BBA023"});
});
test("aluguel usa valor mensal, não preço de venda; sem preço não amplia a busca",()=>{
  const where=similarPropertyWhere({...source,purpose:"LOCACAO",rentalPrice:new Prisma.Decimal(3000)})!;
  assert.deepEqual(where.rentalPrice,{gte:2400,lte:3600});assert.equal(where.price,undefined);
  assert.equal(similarPropertyWhere({...source,price:null}),null);
  assert.equal(similarPropertyWhere({...source,price:new Prisma.Decimal(0)}),null);
});
test("ordena pelo preço mais próximo e não completa com imóveis fora do conjunto",()=>{
  const candidates=[680000,745000,800000,700000,750000].map((price,i)=>({...source,code:`BBA00${i}`,price:new Prisma.Decimal(price)}));
  assert.deepEqual(closestSimilarProperties(source,candidates).map(p=>Number(p.price)),[745000,750000,700000,680000]);
  assert.deepEqual(closestSimilarProperties(source,[]),[]);
});

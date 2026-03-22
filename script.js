const board = document.getElementById('board');
const log = document.getElementById('log');
const moneyDisplay = document.getElementById('money');
const turnDisplay = document.getElementById('turn');

const tiles = new Array(120).fill(null).map((_,i)=>({
  type: i%5===0 ? "property" : i%7===0 ? "tax" : i%9===0 ? "chance" : "empty",
  price: 200,
  rent: 50,
  houses:0,
  owner: null
}));

let players = [
  {name:"Você", pos:0, money:1500, color:"p1"},
  {name:"IA", pos:0, money:1500, color:"p2"}
];

let current = 0;

// Criar tabuleiro
function createBoard(){
  for(let i=0;i<121;i++){
    let tile = document.createElement('div');
    tile.className='tile';
    tile.id = "tile-"+i;
    board.appendChild(tile);
  }
}

// Renderização
function render(){
  document.querySelectorAll('.player').forEach(e=>e.remove());
  document.querySelectorAll('.owner').forEach(e=>e.remove());
  document.querySelectorAll('.house').forEach(e=>e.remove());

  players.forEach((p)=>{
    let el = document.createElement('div');
    el.className='player '+p.color;
    document.getElementById('tile-'+p.pos).appendChild(el);
  });

  tiles.forEach((t,i)=>{
    if(t.owner!==null){
      let o = document.createElement('div');
      o.className='owner';
      o.innerText = t.owner+1;
      document.getElementById('tile-'+i).appendChild(o);
    }

    if(t.houses>0){
      let h = document.createElement('div');
      h.className='house';
      h.innerText = "🏠"+t.houses;
      document.getElementById('tile-'+i).appendChild(h);
    }
  });

  turnDisplay.innerText = "Turno: "+players[current].name;
  moneyDisplay.innerText = players.map(p=>p.name+": $"+p.money).join(" | ");
}

// Log
function logMsg(msg){
  log.innerHTML += msg+"<br>";
  log.scrollTop = log.scrollHeight;
}

// Dado com animação
function rollDice(){
  let dice = Math.floor(Math.random()*6)+1;
  let p = players[current];

  for(let i=0;i<dice;i++){
    setTimeout(()=>{
      p.pos = (p.pos+1)%120;
      render();
    },i*120);
  }

  setTimeout(()=>{
    logMsg(p.name+" tirou "+dice);
    handleTile();
    nextTurn();
  },dice*120+200);
}

// Lógica da casa
function handleTile(){
  let p = players[current];
  let tile = tiles[p.pos];

  if(tile.type==="property"){
    if(tile.owner===null){
      if(p.money>=tile.price){
        if(p.name==="Você"){
          if(confirm("Comprar por $200?")){
            buy(p,tile);
          }
        } else {
          if(Math.random()>0.3) buy(p,tile);
        }
      }
    } else if(tile.owner!==current){
      let rent = tile.rent + (tile.houses*40);
      p.money -= rent;
      players[tile.owner].money += rent;
      logMsg("💸 Pagou aluguel "+rent);
    }
  }

  if(tile.type==="tax"){
    p.money -= 100;
    logMsg("💰 Taxa paga");
  }

  if(tile.type==="chance"){
    let r = Math.random();
    if(r<0.5){
      p.money+=200;
      logMsg("🎁 Sorte!");
    } else {
      p.money-=150;
      logMsg("⚠️ Azar!");
    }
  }

  checkBankruptcy();
  render();
}

// Comprar
function buy(player,tile){
  player.money -= tile.price;
  tile.owner = current;
  logMsg(player.name+" comprou terreno");
}

// Construir casa
function buildHouse(){
  let p = players[current];
  let tile = tiles[p.pos];

  if(tile.owner===current){
    if(p.money>=150){
      tile.houses++;
      p.money -= 150;
      logMsg("🏠 Casa construída");
      render();
    }
  }
}

// Falência
function checkBankruptcy(){
  players.forEach((p,i)=>{
    if(p.money<=0){
      alert(p.name+" faliu! Fim de jogo.");
      location.reload();
    }
  });
}

// Turno IA
function aiTurn(){
  rollDice();
}

// Próximo turno
function nextTurn(){
  current = (current+1)%players.length;
  render();

  if(players[current].name==="IA"){
    setTimeout(aiTurn,1000);
  }
}

// Inicialização
createBoard();
render();

// Deterministic stress check, not a human difficulty or win-rate study.
// A simple space-seeking bot exercises real waves and boss encounter timers.
const { engine } = require('./harness.cjs');
const waves = [0,1,2,3,4,5,7,9,14,24];
const results = [];
for (const wave of waves) {
    const runs = [];
    for (let seed = 1; seed <= 40; seed++) {
        const e = engine({ seed });
        e.run(`currentWave=${wave}; startCountdown(); gameState=PLAYING; soundEnabled=false;`);
        runs.push(e.run(`(() => {
            let warningCount=0, hits=0, phase='patrol';
            for (let tick=0;tick<1800 && gameState===PLAYING;tick++) {
                const dirs=getPossibleDirections(player.dir);
                let best=-Infinity, chosen=player.dir;
                for(const dir of dirs) {
                    const d=dirToDelta(dir), x=player.x+d.dx, y=player.y+d.dy;
                    if(isOutOfBounds(x,y) || (occupiedGrid[x][y]!==null && gameTime-trailTimeGrid[x][y]>=FRESH_POOP_DURATION) || unicorns.some(u=>u!==player&&u.alive&&Math.abs(u.x-x)+Math.abs(u.y-y)<=1)) continue;
                    const seen=new Set(), queue=[[x,y]];
                    for(let n=0;n<queue.length&&seen.size<120;n++) {
                        const [qx,qy]=queue[n], key=qx+','+qy;
                        if(seen.has(key)||isOutOfBounds(qx,qy)||occupiedGrid[qx][qy]!==null)continue;
                        seen.add(key); queue.push([qx+1,qy],[qx-1,qy],[qx,qy+1],[qx,qy-1]);
                    }
                    let value=seen.size+scoreDirection(player.x,player.y,dir,8)*3+(dir===player.dir?2:0);
                    if(boss?.alive&&boss.phase==='attack') {
                        const bd=dirToDelta(boss.attackDir);
                        if((bd.dx&&y===boss.y)||(bd.dy&&x===boss.x)) value-=60;
                    }
                    if(value>best){best=value;chosen=dir;}
                }
                player.nextDir=chosen;
                if(boss?.alive && (boss.x-(player.x-dirToDelta(player.dir).dx*2))**2+(boss.y-(player.y-dirToDelta(player.dir).dy*2))**2<=9) triggerSplatter();
                const health=boss?.health;
                updateGame(50);
                if(boss?.phase==='telegraph'&&phase!=='telegraph')warningCount++;
                phase=boss?.phase;
                if(boss&&boss.health<health)hits++;
            }
            return {seconds:survivalTimer/1000,won:gameState===WIN,unfinished:gameState===PLAYING,warnings:warningCount,hits,reason:lastCrash?.reason||''};
        })()`));
    }
    const times = runs.map(r=>r.seconds).sort((a,b)=>a-b);
    results.push({wave:wave+1,boss:wave%5===4,clears:runs.filter(r=>r.won).length,unfinished:runs.filter(r=>r.unfinished).length,medianSeconds:Number(times[20].toFixed(1)),p90Seconds:Number(times[36].toFixed(1)),meanWarnings:Number((runs.reduce((s,r)=>s+r.warnings,0)/40).toFixed(1)),meanHits:Number((runs.reduce((s,r)=>s+r.hits,0)/40).toFixed(1))});
}
console.table(results);

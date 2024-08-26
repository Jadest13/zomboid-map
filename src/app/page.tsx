"use client";

import Image from "next/image";
import { connectDB } from "./api/database";
import { useEffect, useRef, useState } from "react";


export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mapInfo, setMapInfo] = useState<any>({});
  const [mapStatus, setMapStatus] = useState<any>({});
  const [mapSequence, setMapSequence] = useState<any[]>([]);

  // const getDB = async () => {
  //   const client = await connectDB;
  //   const db = client.db("map")
    
  //   let result = await db.collection('info').find().toArray();
  //   console.log(result);
  // }

  const getMap = async() => {
    await fetch('/api/maps', {
      method: 'GET',
    }).then(async (res) => {
      const data = await res.json();

      const map_list:any = {};
      
      data.map((e: any, i: number) => {
        const name = e.map
        if(!(name in map_list)) {
          map_list[name] = {
            cells: [],
          }
        }
        map_list[name].cells.push(e.cell)
      })

      setMapInfo(map_list);

    }).catch((err) => {
      console.log(err);
    })
    
    await fetch('/api/maps/list', {
      method: 'GET',
    }).then(async (res) => {
      const data = await res.json();
      const map_status_list:any = {};

      data.map((e: any) => {
        map_status_list[e] = false;
      })
      setMapStatus(map_status_list);

    }).catch((err) => {
      console.log(err);
    })

  }

  useEffect(() => {
    
    const canvas = canvasRef.current;
    if(canvas == null) return;
    
    canvas.width = 15600;
    canvas.height = 17100;

    getMap();
  }, []);

  useEffect(() => {
    console.log("hello");

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2.5;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    console.log(mapStatus);

    mapSequence.map((e) => {
      console.log(e);

      mapInfo[e]["cells"].map((e: any) => {
        const cell_x = e.x;
        const cell_y = e.y;

        ctx.fillStyle = "#d0cbb7";
        ctx.fillRect(cell_x*300, cell_y*300, 300, 300);

        e.features.map((e: any) => {
          
          if(e.name == "") {
            ctx.fillStyle = "#00000000";
          } else if(e.name == "natural") {
            ctx.fillStyle = "#b6bca0";
          } else if(e.name == "building") {
            ctx.fillStyle = "#be9e7a";
          } else if(e.name == "highway") {
            ctx.fillStyle = "#827a6d";
          } else if(e.name == "water") {
            ctx.fillStyle = "#448c92";
          } else {
            ctx.fillStyle = "#FF0000";
          }

          ctx.beginPath();
          e.geometry.coordinates.map((e:any, i:number) => {
            e.map((e:any, i:number) => {
              if(i == 0) {
                ctx.moveTo(cell_x*300+e[0], cell_y*300+e[1]);
              } else {
                ctx.lineTo(cell_x*300+e[0], cell_y*300+e[1]);
              }
            })
          })
          ctx.closePath();
          ctx.fill();
        })
      })
    })

  }, [mapSequence]);


  return (
    <main className="flex min-h-screen m-0">
      <div className="fixed">
        {
          (Object.entries(mapStatus) as [any, any]).map((e, i) => {
            const name = e[0];
            return (
              <label key={name} className="flex w-full justify-between gap-4">
                <p>{name}</p>
                <input type="checkbox" checked={e[1].status} onChange={(e) => {
                  let map_status_list = mapStatus;
                  let map_sequence = mapSequence;
                  if(map_status_list[name] == true) {
                    map_sequence = map_sequence.filter((e) => e != name);
                    setMapSequence(map_sequence);
                  } else {
                    setMapSequence(mapSequence => [...mapSequence, name]);
                  }
                  map_status_list[name] = !map_status_list[name];
                  console.log(map_sequence);
                  setMapStatus(map_status_list);
                }}/>
              </label>
            )
          })
        }
        {/* <button onClick={setMap}>asd</button> */}
      </div>
      <canvas ref={canvasRef} className="m-0">

      </canvas>
    </main>
  );
}

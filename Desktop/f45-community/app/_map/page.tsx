'use client'

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'

declare global { interface Window { naver: any } }

const BRANCHES = [
  { id: 1,  name: 'F45 강남',   lat: 37.5009, lng: 127.0240, address: '서울 강남구 강남대로' },
  { id: 2,  name: 'F45 역삼',   lat: 37.5004, lng: 127.0369, address: '서울 강남구 역삼동' },
  { id: 3,  name: 'F45 여의도', lat: 37.5215, lng: 126.9244, address: '서울 영등포구 여의도동' },
  { id: 4,  name: 'F45 성수',   lat: 37.5465, lng: 127.0554, address: '서울 성동구 성수동' },
  { id: 5,  name: 'F45 신사',   lat: 37.5220, lng: 127.0210, address: '서울 강남구 신사동' },
  { id: 6,  name: 'F45 사당',   lat: 37.4768, lng: 126.9815, address: '서울 동작구 사당동' },
  { id: 7,  name: 'F45 신촌',   lat: 37.5553, lng: 126.9373, address: '서울 서대문구 창천동' },
  { id: 8,  name: 'F45 공덕',   lat: 37.5447, lng: 126.9519, address: '서울 마포구 공덕동' },
  { id: 9,  name: 'F45 광화문', lat: 37.5744, lng: 126.9769, address: '서울 종로구 세종대로' },
  { id: 10, name: 'F45 마곡',   lat: 37.5596, lng: 126.8348, address: '서울 강서구 마곡동' },
  { id: 11, name: 'F45 교대',   lat: 37.4941, lng: 127.0139, address: '서울 서초구 서초동' },
  { id: 12, name: 'F45 한남',   lat: 37.5347, lng: 126.9989, address: '서울 용산구 한남동' },
  { id: 13, name: 'F45 신논현', lat: 37.5051, lng: 127.0244, address: '서울 강남구 논현동' },
  { id: 14, name: 'F45 잠실',   lat: 37.5128, lng: 127.0994, address: '서울 송파구 잠실동' },
  { id: 15, name: 'F45 판교',   lat: 37.3943, lng: 127.1113, address: '경기도 성남시 분당구 판교동' },
  { id: 16, name: 'F45 광교',   lat: 37.2832, lng: 127.0438, address: '경기도 수원시 영통구 광교동' },
  { id: 17, name: 'F45 신중동', lat: 37.5036, lng: 126.7659, address: '경기도 부천시 원미구 중동' },
  { id: 18, name: 'F45 다산',   lat: 37.5994, lng: 127.1586, address: '경기도 남양주시 다산동', home: true },
]

const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID!

export default function MapPage() {
  const mapRef     = useRef<HTMLDivElement>(null)
  const mapObj     = useRef<any>(null)
  const infoWinRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [ready, setReady] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    let alive = true

    if (!document.getElementById('naver-map-sdk')) {
      const s  = document.createElement('script')
      s.id     = 'naver-map-sdk'
      s.src    = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${CLIENT_ID}`
      s.async  = true
      document.head.appendChild(s)
    }

    let attempts = 0
    function poll() {
      if (!alive) return
      if (window.naver?.maps && mapRef.current) { initMap(); return }
      if (++attempts >= 50) {
        setErrMsg(
          `지도를 불러오지 못했습니다.\n` +
          `window.naver: ${!!window.naver ? '있음' : '없음'}\n` +
          `window.naver.maps: ${!!window.naver?.maps ? '있음' : '없음 (도메인 미인증일 수 있음)'}`
        )
        return
      }
      setTimeout(poll, 200)
    }

    function markerIcon(color: string) {
      return {
        content: `<div style="cursor:pointer;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 30 40">
            <path d="M15 0C6.7 0 0 6.7 0 15c0 11 15 25 15 25S30 26 30 15C30 6.7 23.3 0 15 0z"
              fill="${color}" stroke="white" stroke-width="1.8"/>
            <text x="15" y="19" text-anchor="middle" fill="white"
              font-family="Arial,sans-serif" font-size="8" font-weight="900">F45</text>
          </svg></div>`,
        anchor: new window.naver.maps.Point(16, 44),
      }
    }

    function infoContent(b: typeof BRANCHES[number], color: string) {
      return `<div style="
        padding:10px 14px;
        background:#12121f;
        border:1px solid rgba(255,255,255,0.14);
        border-radius:12px;
        min-width:170px;
        box-shadow:0 6px 24px rgba(0,0,0,0.5);
        font-family:system-ui,sans-serif;
      ">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
          <span style="background:${color};color:#fff;font-size:9px;font-weight:900;padding:3px 7px;border-radius:6px;letter-spacing:.5px">F45</span>
          <span style="color:#fff;font-weight:700;font-size:13px">${b.name}</span>
          ${b.home ? '<span style="color:#60a5fa;font-size:10px;font-weight:600">홈</span>' : ''}
        </div>
        <p style="color:rgba(255,255,255,0.55);font-size:11px;margin:0;line-height:1.4">${b.address}</p>
      </div>`
    }

    function initMap() {
      if (!alive || !mapRef.current) return
      try {
        mapRef.current.innerHTML = ''
        mapObj.current = null
        markersRef.current = []

        const map = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(37.5300, 127.0100),
          zoom: 10,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
            style: window.naver.maps.ZoomControlStyle.SMALL,
          },
          scaleControl: false,
          mapDataControl: false,
        })
        mapObj.current = map

        const infoWindow = new window.naver.maps.InfoWindow({
          borderWidth: 0,
          backgroundColor: 'transparent',
          disableAnchor: true,
          pixelOffset: new window.naver.maps.Point(0, -8),
        })
        infoWinRef.current = infoWindow

        BRANCHES.forEach((b, i) => {
          const color  = b.home ? '#003DA5' : '#E8002D'
          const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(b.lat, b.lng),
            map,
            icon: markerIcon(color),
            title: b.name,
            zIndex: b.home ? 10 : 1,
          })
          markersRef.current[i] = marker

          window.naver.maps.Event.addListener(marker, 'click', () => {
            if (!alive) return
            if (infoWindow.getMap() && infoWindow.getPosition()?.equals(new window.naver.maps.LatLng(b.lat, b.lng))) {
              infoWindow.close()
              return
            }
            infoWindow.setContent(infoContent(b, color))
            infoWindow.open(map, marker)
          })
        })

        window.naver.maps.Event.addListener(map, 'click', () => infoWindow.close())

        if (alive) setReady(true)
      } catch (e: any) {
        if (alive) setErrMsg(e?.message ?? String(e))
      }
    }

    poll()
    return () => { alive = false }
  }, [])

  function flyTo(b: typeof BRANCHES[number], idx: number) {
    if (!mapObj.current || !window.naver?.maps) return
    const latlng = new window.naver.maps.LatLng(b.lat, b.lng)
    mapObj.current.panTo(latlng)
    mapObj.current.setZoom(15, true)

    const marker = markersRef.current[idx]
    const color  = b.home ? '#003DA5' : '#E8002D'
    if (marker && infoWinRef.current) {
      infoWinRef.current.setContent(
        `<div style="padding:10px 14px;background:#12121f;border:1px solid rgba(255,255,255,0.14);border-radius:12px;min-width:170px;box-shadow:0 6px 24px rgba(0,0,0,0.5);font-family:system-ui,sans-serif">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <span style="background:${color};color:#fff;font-size:9px;font-weight:900;padding:3px 7px;border-radius:6px">F45</span>
            <span style="color:#fff;font-weight:700;font-size:13px">${b.name}</span>
            ${b.home ? '<span style="color:#60a5fa;font-size:10px;font-weight:600">홈</span>' : ''}
          </div>
          <p style="color:rgba(255,255,255,0.55);font-size:11px;margin:0;line-height:1.4">${b.address}</p>
        </div>`
      )
      infoWinRef.current.open(mapObj.current, marker)
    }
  }

  return (
    <div className="bg-f45-dark">
      <Navbar />

      <div className="relative w-full" style={{ marginTop: 64, height: 'calc(100vh - 64px)' }}>

        {/* 지도 컨테이너 */}
        <div ref={mapRef} className="absolute inset-0" />

        {/* 로딩 */}
        {!ready && !errMsg && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-f45-dark gap-3">
            <div className="w-10 h-10 border-2 border-f45-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-white/50 text-sm">지도 불러오는 중...</p>
          </div>
        )}

        {/* 에러 */}
        {errMsg && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-f45-dark gap-4 px-6 text-center">
            <p className="text-4xl">🗺️</p>
            <p className="text-red-400 text-sm font-mono bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 whitespace-pre-wrap max-w-sm">{errMsg}</p>
          </div>
        )}

        {/* 지점 사이드바 */}
        {ready && (
          <div className="absolute z-20 left-3 top-3 bottom-3 w-52 flex flex-col bg-f45-dark/90 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl overflow-hidden
            max-sm:top-auto max-sm:left-3 max-sm:right-3 max-sm:bottom-3 max-sm:w-auto max-sm:h-32">
            <p className="px-3 pt-2.5 pb-2 border-b border-white/10 text-white font-black text-xs flex-shrink-0">
              🏋️ F45 지점 · {BRANCHES.length}곳
            </p>
            <div className="overflow-y-auto flex-1 p-1.5
              max-sm:flex max-sm:flex-row max-sm:overflow-x-auto max-sm:overflow-y-hidden">
              {BRANCHES.map((b, i) => (
                <button key={b.id} onClick={() => flyTo(b, i)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-all
                    max-sm:flex-shrink-0 max-sm:w-36
                    ${b.home
                      ? 'bg-f45-blue/15 border border-f45-blue/40'
                      : 'hover:bg-white/8 border border-transparent'}`}>
                  <p className="text-white text-xs font-bold truncate">
                    {b.home ? '🏠 ' : '📍 '}{b.name}
                  </p>
                  <p className="text-white/35 text-[11px] truncate">{b.address}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

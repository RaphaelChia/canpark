import mapboxgl from "!mapbox-gl"
import {useRef, useEffect,useState } from "react"
import { debounce, SVY21 } from "../../utils"

import styles from '../../styles/Search.module.css'
import { FaSpinner } from "react-icons/fa"

const Map = ({mapMoving,setMapMoving, showLL, getCarparks, moveToSingleMarker, resetSingleSearch}) => {
    
     // MAP BOX STUFF
     const punggol = {lng:103.9079,lat:1.3985}

     mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOXKEY
     const mapContainer = useRef(null);
     const map = useRef(null);
     const [lng, setLng] = useState(punggol.lng);
     const [lat, setLat] = useState(punggol.lat);
     const [zoom, setZoom] = useState(13);
     const [markers,setMarkers] = useState([])
     const [retrievingMarkers,setRetrievingMarkers] = useState(false)
     const bound = [
         [103.6156,1.2198],
         [104.01420,1.4778]
     ]

     useEffect(()=>{
        if (moveToSingleMarker==null) return
        const s = new SVY21()
        clearMarkers()
        const newLatLon = s.computeLatLon(moveToSingleMarker.y_coord,moveToSingleMarker.x_coord)
        map.current.flyTo({
            center:[
                newLatLon.lng,
                newLatLon.lat
            ],
            zoom:15,
            essential: true 
        })
        const lotProcessed = processLots(moveToSingleMarker)
        setMarkers([
            new mapboxgl.Marker({
                color: lotProcessed.color,
            }).setLngLat(newLatLon)
            .setPopup(new mapboxgl.Popup().setHTML(`<p>${moveToSingleMarker.address}</p><p>${lotProcessed.lots_text}</p>`))
            .addTo(map.current)
        ])
    },[moveToSingleMarker])

     useEffect(() => {
        //  if (map.current) return; // initialize map only once
         map.current = new mapboxgl.Map({
           container: mapContainer.current,
           style: 'mapbox://styles/mapbox/streets-v11?optimize=true',
           center: [lng, lat],
           zoom: zoom,
           maxBounds:bound
         });
         const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        });
        // Add the control to the map.
        map.current.addControl(geolocate);

        // onMove Listener for map
        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
            mapIsMoving()
            resetSingleSearch()
        });
        // Set an event listener that fires
        // when a geolocate event occurs.
        // geolocate.on('geolocate', () => {
        //     console.log('A geolocate event has occurred.');
        // });
     },[]);

     const processLots = (cpItem) =>{
        let retObj = {}
        retObj.lots_text = ""
        retObj.lots_avail = Number(0)
        retObj.lots_total = Number(0)
        retObj.color = ""
        for (var i in cpItem.carpark_info){
            retObj.lots_avail = retObj.lots_avail + +cpItem.carpark_info[i].lots_available
            retObj.lots_total = retObj.lots_total + +cpItem.carpark_info[i].total_lots
        
            retObj.lots_text += `<p>Lot Type: ${cpItem.carpark_info[i].lot_type}<br>`
            retObj.lots_text += `Available: ${cpItem.carpark_info[i].lots_available}/${cpItem.carpark_info[i].total_lots} </p>`
        }
        if (!("carpark_info" in cpItem)){
            retObj.color = "#f5f5f5"
            retObj.lots_text = "<p>No data available</p>"
        } else if (retObj.lots_avail/retObj.lots_total<0.2 && retObj.lots_avail/retObj.lots_total>0){
            retObj.color="#ff9100"
        } else if(retObj.lots_avail==0){
            retObj.color ='#ff482f'
        } else {
            retObj.color = '#0fe950'
        }
        return retObj
     }
 
 
    const populateMarkers = async() => {
        if(retrievingMarkers)return
        setRetrievingMarkers(true)
        
        const s = new SVY21()
        const cpItems = await getCarparks(map.current.getBounds())
        let tempMarkers = []
        for(var x in cpItems){
            let lotProcessed = processLots(cpItems[x])
            const marker = new mapboxgl.Marker({
                color: lotProcessed.color,
            }).setLngLat(s.computeLatLon(cpItems[x].y_coord,cpItems[x].x_coord))
            .setPopup(new mapboxgl.Popup().setHTML(`<p>${cpItems[x].address}</p><p>${lotProcessed.lots_text}</p>`))
            .addTo(map.current);
            tempMarkers.push(marker)
        }
        clearMarkers()
        setMarkers(tempMarkers)
        setRetrievingMarkers(false)
    }

     const clearMarkers = () => {
         for(var i in markers){
            markers[i].remove()
         }
         setMarkers([])
     }

    const specialDebounce = (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            setMapMoving(true)
            timeout = setTimeout(() => {
                // timeout = null;
                func.apply(this, args);
            }, wait);
        };
    };

    const mapIsMoving = specialDebounce(()=>{
        setMapMoving(false)
    },500)

    
     // MAP BOX STUFF ENDS
    return (
        <div>
            <div ref={mapContainer} className={styles.mapContainer} />
            <div className = {styles.mapLLContainer}>
                {showLL && <div className={styles.mapLL}>
                    {lat} {lng}
                </div>}
                {!mapMoving && <div onClick={debounce(populateMarkers,300)} className = {styles.flexRowCenter+' '+styles.btnsearchhere}>
                    <div className = {`${styles.searchThisAreaText} noSelectClick ${retrievingMarkers?styles.searchThisAreaTextGrow:''}`}>
                        Search This Area
                        {retrievingMarkers &&
                            <FaSpinner className = {`${styles.searchThisAreaSpinner}`}/>
                        }
                    </div>
                </div>}
            </div>
        </div>
    )
}

export default Map

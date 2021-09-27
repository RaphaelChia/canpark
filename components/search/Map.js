import mapboxgl from "!mapbox-gl"
import {useRef, useEffect,useState } from "react"
import { debounce, SVY21 } from "../../utils"

import styles from '../../styles/Search.module.css'
import { FaSpinner } from "react-icons/fa"

const Map = ({showLL, getCarparks}) => {
    
     // MAP BOX STUFF
     const punggol = {lng:103.9079,lat:1.3985}

     mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOXKEY
     const mapContainer = useRef(null);
     const map = useRef(null);
     const [lng, setLng] = useState(punggol.lng);
     const [lat, setLat] = useState(punggol.lat);
     const [zoom, setZoom] = useState(13);
     const [markers,setMarkers] = useState([])
     const [mapMoving,setMapMoving] = useState(false)
     const [retrievingMarkers,setRetrievingMarkers] = useState(false)
     const bound = [
         [103.6156,1.2198],
         [104.01420,1.4778]
     ]
     useEffect(() => {
         console.log("init map")
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
        });
        // Set an event listener that fires
        // when a geolocate event occurs.
        // geolocate.on('geolocate', () => {
        //     console.log('A geolocate event has occurred.');
        // });
     },[]);
 
 
    const populateMarkers = async() => {
        setRetrievingMarkers(true)
        clearMarkers()
        const s = new SVY21()
        const cpItems = await getCarparks(map.current.getBounds())
        let tempMarkers = []
        for(var x in cpItems){
            let lots_text = ""
            let lots_avail = Number(0)
            let lots_total = Number(0)
            let color = ""
            for (var i in cpItems[x].carpark_info){
                lots_avail = lots_avail + +cpItems[x].carpark_info[i].lots_available
                lots_total = lots_total + +cpItems[x].carpark_info[i].total_lots
            
                lots_text += `<p>Lot Type: ${cpItems[x].carpark_info[i].lot_type}<br>`
                lots_text += `Available: ${cpItems[x].carpark_info[i].lots_available}/${cpItems[x].carpark_info[i].total_lots} </p>`
            }
            if (!("carpark_info" in cpItems[x])){
                color = "#f5f5f5"
                lots_text = "<p>No data available</p>"
            } else if (lots_avail/lots_total<0.2 && lots_avail/lots_total>0){
                color="#ff9100"
            } else if(lots_avail==0){
                color ='#ff482f'
            } else {
                color = '#0fe950'
            }
            const marker = new mapboxgl.Marker({
                color: color,
            }).setLngLat(s.computeLatLon(cpItems[x].y_coord,cpItems[x].x_coord))
            .setPopup(new mapboxgl.Popup().setHTML(`<p>${cpItems[x].address}</p><p>${lots_text}</p>`))
            .addTo(map.current);
            tempMarkers.push(marker)
        }
        setMarkers(tempMarkers)
        setRetrievingMarkers(false)
    }

     const clearMarkers = () => {
         console.log('clearing markers!')
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
                    <div className = {`${styles.searchThisAreaText} ${retrievingMarkers?styles.searchThisAreaTextGrow:''}`}>
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

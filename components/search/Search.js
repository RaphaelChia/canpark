import {useEffect,useState } from "react"
import Search_item from "./Search_item"
// import 'bootstrap/dist/css/bootstrap.min.css'
import styles from "../../styles/Search.module.css"
import Pagination from "../pagination/Pagination"
import Settings from "../settings/Settings"
import Map from "./Map"
import {FaCog, FaSpinner} from 'react-icons/fa'
// import { debounce,isWithinMap } from "../../pages"
import { debounce,isWithinMap,SVY21 } from "../../utils"
// import { debounce } from "../../pages"

const Search = () => {
    const [searchResult, SetSearchResult] = useState([]) // The entire set of cp vacancies without cp info
    const [FilteredResult, setFilteredResult] = useState(searchResult) // Search filter result
    const [KeywordSearch, setKeywordSearch] = useState("")
    const [SearchResultLoaded, setSearchResultLoaded] = useState(true)
    const [SingleSearchResult, setSingleSearchResult] = useState(null) // For when search is clicked
    const [mapMoving,setMapMoving] = useState(false)
    const [hideFilteredResult,setHideFilteredResult] = useState(false)
    const [ToolTipStreetSpelling, setToolTipStreetSpelling] = useState(false)
    const [ToolTipPositionOffeset,setToolTipPositionOffeset] = useState(0)

    const NEXT_PUBLIC_CARPARK_INFO_URL="https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c"
    const NEXT_PUBLIC_HDBCARPARK_AVAIL_URL="https://api.data.gov.sg/v1/transport/carpark-availability"
    const NEXT_PUBLIC_URACARPARK_TOKEN_URL="https://www.ura.gov.sg/uraDataService/insertNewToken.action"
    const NEXT_PUBLIC_URACARPARK_INFO_URL="https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Availability"
    
    // Settings 
    const tempRPP = 6
    const [ShowSettings, setShowSettings] = useState(false)
    const [ResultPerPage, setResultPerPage] = useState(tempRPP)
    const [ShowLL, setShowLL] = useState(true)
    const [ShowFreeParking,setShowFreeParking] = useState(false)
    const [ShowMultiStorey,setShowMultiStorey] = useState(false)
    const [ShowOpenSpaceParking,setShowOpenSpaceParking] = useState(false)
    const [startend, setstartend] = useState({start:0,end:ResultPerPage})

 
    useEffect(() => {
        const load_api = async() => {
            let carparkData = null
            while(true){
                carparkData = await getHDBCarParkAvailabilityInfo()
                if (carparkData){
                    break
                }
            }
            SetSearchResult(carparkData.items[0].carpark_data)
            setFilteredResult([])
        }
        load_api()
    }, [])


    useEffect(() => {
        updateFilteredResultsByKW()
    }, [KeywordSearch])


    

    const updateFilteredResultsByKW = async () =>{ 
        setSearchResultLoaded(false)
        if(KeywordSearch.length==0){
            setSearchResultLoaded(true)
            setFilteredResult([])
            return
        }
        try {
            // Basically trying to merge 2 different API results into 1 object
            const data = await getCarParkDetails(KeywordSearch)
            const finalList = []
            for(var x in data.result.records){
                const fil2 = searchResult.filter((item)=>(
                    item.carpark_number.toLowerCase() === data.result.records[x].car_park_no.toLowerCase()
                ))
                if(fil2.length>0){
                    finalList.push(Object.assign(data.result.records[x],fil2[0]))
                }
            }
            setFilteredResult(finalList)
        } catch (error) {
            console.error("Error Occurred",error)
        }
        setSearchResultLoaded(true)
        
    }

    const getCarParkDetails = async (kw) => {
        const res = await fetch(`${NEXT_PUBLIC_CARPARK_INFO_URL}&limit=5000${kw?'&q='+kw:''}`)
        const data = await res.json()
        return data
        //Will only return 100 data, need to go next link to get next.
    }

    
    
    const getHDBCarParkAvailabilityInfo = async () =>{
        const res = await fetch(NEXT_PUBLIC_HDBCARPARK_AVAIL_URL)
        const data = await res.json()
        return data
    }    


    // const getURAToken = async() =>{
    //     let headers = new Headers()
    
    //     headers.append('AccessKey',NEXT_PUBLIC_URAACCESSKEY)

    //     const res = await fetch(NEXT_PUBLIC_URACARPARK_TOKEN_URL,{
    //         method:'GET',
    //         headers:headers,
    //     })
    //     const data = await res.json()
    //     console.log(data.Result)
    //     return data.Result
    // }
    // const getURACarParksInfo = async () =>{
    //     const res = await fetch(NEXT_PUBLIC_URACARPARK_INFO_URL)
    //     const data = await res.json()
    //     return data
    // }

    const getCarParkFilteredByCoord = async(mapCoords) =>{
        const cpd = await getCarParkDetails()
        const records = cpd.result.records
        const s = new SVY21()
        const recordsWithinViewport = records.filter((item)=>isWithinMap(s.computeLatLon(item.y_coord,item.x_coord),
        mapCoords))
        for(var x in recordsWithinViewport){
            const fil2 = searchResult.filter((item)=>(
                item.carpark_number.toLowerCase() === recordsWithinViewport[x].car_park_no.toLowerCase()
            ))
            if(fil2.length>0){
                Object.assign(recordsWithinViewport[x],fil2[0])
            }
        }
        return recordsWithinViewport
    }



    const toggleShowSettings = () =>{
        setShowSettings(!ShowSettings)
    }

    const setKeyword_debounce = debounce(
        (e)=>setKeywordSearch(e.target.value.replace(/[^a-zA-Z\d ]/ig, "")),
        300
    )

    const resetSingleSearch = () => {
        setSingleSearchResult(null)
    }

    const showStreetSpellingToolTip = (e) => {
        const targetString = KeywordSearch==""?'st ':" st "
        if(e.target.value.toLowerCase().includes(targetString)){
            setToolTipPositionOffeset(e.target.value.toLowerCase().indexOf(targetString)+1)
            setToolTipStreetSpelling(true)
        } else {
            setToolTipStreetSpelling(false)
        }
    }

    return (
        <div className={styles.container}>
            <Map mapMoving = {mapMoving} setMapMoving = {setMapMoving} resetSingleSearch = {resetSingleSearch} moveToSingleMarker={SingleSearchResult} getCarparks = {getCarParkFilteredByCoord} showLL = {ShowLL}/>
            <form className={styles.searchbar} onSubmit = {(e)=>{e.preventDefault()}}>
                <input onFocus={()=>setHideFilteredResult(false)} onBlur={()=>setToolTipStreetSpelling(false)} onChange={showStreetSpellingToolTip} autoComplete="off" type="text" placeholder="Street 72 / Blk 689" name ="search_keyword" onKeyUp={setKeyword_debounce} />  
                {!SearchResultLoaded && <FaSpinner className ={styles.searchSpinner}></FaSpinner>}
                <div className={styles.settings_btn} onClick={toggleShowSettings}>
                    <FaCog/>
                </div>
            </form>
            {ToolTipStreetSpelling&&<span style={{left:`${ToolTipPositionOffeset}ch`,}} className={styles.toolTipBottom}>Try replacing st with 'street' if you can't get what you want.</span>}
            {KeywordSearch=="" && <div className={styles.initialToolTip}>
                <span>Search for a carpark name! </span>
                <span>e.g. 650 Damai</span>
                <span>e.g. St 61</span>
            </div>}

            <div className={`${'noSelectClick '+styles.cardrows + ' ' + (mapMoving?styles.dim:'')}`}>
                {!hideFilteredResult && FilteredResult.map((sr,index)=>(
                    KeywordSearch.length>0 && index>=startend.start && index<startend.end && <Search_item setHideFilteredResult={setHideFilteredResult} setSingleSearchResult={setSingleSearchResult} item={sr} key={index}/>
                ))}
            </div>
            
            {ShowSettings && <Settings 
                setShowSettings={setShowSettings} 
                setShowLL = {setShowLL} 
                showLL = {ShowLL}
                setShowMultiStorey = {setShowMultiStorey}
                ShowMultiStorey = {ShowMultiStorey}
                setShowFreeParking = {setShowFreeParking}
                ShowFreeParking = {ShowFreeParking}
                setShowOpenSpaceParking = {setShowOpenSpaceParking}
                ShowOpenSpaceParking = {ShowOpenSpaceParking}/>}
            {/* <Pagination showSettings = {ShowSettings} setstartend = {setstartend} searchResult = {FilteredResult}></Pagination> */}
            
        </div>
    )
}
export default Search

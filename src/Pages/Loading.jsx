import CircleLoader from "../Components/CircleLoader"

export default function Loading() {
    return (
        <div className="w-screen h-screen fixed text-xl font-[raleway] text-gray-500 flex-col flex top-0 left-0 z-50 items-center justify-center bg-[#ffffff]">
            {/* <PropagateLoader size={22} color="#0ea5e9" />  */}
            <CircleLoader
                meshColor={"#9333ea"}
                lightColor={"#ddd6fe"}
                duration={2.5}
                desktopSize={"70px"}
                mobileSize={"64px"}
            />
            Loading...
        </div>
    )
}
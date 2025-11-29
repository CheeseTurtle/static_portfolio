type YearValueProps = {
    rangeMinYear: number,
    rangeMaxYear: number
    minYear: number | null | undefined,
    maxYear: number | null | undefined,
}

export default function YearValue({minYear, rangeMaxYear, rangeMinYear, maxYear}: YearValueProps) {
    // return <div className="flex items-center space-x-2">
    //     <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full">2023</span>
    //     <span className="text-gray-600">-</span>
    //     <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full">2025</span>
    // </div>;

    return <div className="inline-flex items-center space-x-2 text-xs   ">
        <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
            {minYear ?? rangeMinYear}
        </span>
        <span className="text-gray-600 select-text">-</span>
        {/* <span className="text-gray-600 select-none">-</span> */}
        <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
            {maxYear ?? rangeMaxYear}
        </span>
    </div>;

}
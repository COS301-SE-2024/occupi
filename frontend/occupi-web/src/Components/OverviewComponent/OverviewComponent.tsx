import { GraphContainer } from "@components/index";

const OverviewComponent = () => {
    return (
        <div>
            <div className="flex gap-10 ml-10 mt-10">
            <GraphContainer />
                <GraphContainer />
                <GraphContainer />
            </div>
            <div className="flex gap-10 mt-20 ml-10">
                <GraphContainer width="39.063vw" height="50.063vw"/>
                <GraphContainer width="40.063vw" height="40.063vw"/>

            </div>
        </div>
    )
}

export default OverviewComponent
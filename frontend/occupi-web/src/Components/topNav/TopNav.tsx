type TopNavProps = {
    mainComponent?: JSX.Element;
    searchQuery: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
  
  
  const TopNav = (props: TopNavProps) => {
    return (
        <div className="sticky top-0 z-10 overflow-hidden border-b-[2px] border-b-gray_900 flex items-center justify-between h-[110px] backdrop-blur-[20px] bg-primary_40">
          <div className="ml-[30px]">
            {props.mainComponent}
          </div>
  
          <input
            type="text"
            placeholder="ctrl/cmd-k to search"
            className="w-[30vw] h-[50px] rounded-[15px] bg-secondary p-[8px] mr-[30px]"
            value={props.searchQuery}
            onChange={props.onChange}
          />
        </div>
    )
  }
  
  export default TopNav
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FlexSearch from "flexsearch";
import { pages } from "./SearchContent";
import {Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Input} from "@nextui-org/react";

const GlobalSearch = () => {
    const [index] = useState(new FlexSearch.Index({
        tokenize: "forward",  // Enables partial matching (prefix search)
}));
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<FlexSearch.IndexSearchResult>([]);
    const navigate = useNavigate();
    const {isOpen, onOpen, onClose} = useDisclosure();
    
    const handleKeyPress = (event: KeyboardEvent) => {
        // Check if Ctrl + K or Cmd + K was pressed
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault(); // Prevent default browser behavior (e.g., focusing browser search)
          onOpen(); // Focus the search input
        }
    };
    
    useEffect(() => {
        // Attach the event listener on component mount
        window.addEventListener('keydown', handleKeyPress);
    
        // Cleanup the event listener on component unmount
        return () => {
          window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    // Index data
    useEffect(() => {
        pages.forEach((page) => {
        index.add(page.id, page.title + " " + page.description);
        });
    }, [index]);

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length > 0) {
        const searchResults = index.search(e.target.value);
        setResults(searchResults);
        } else {
        setResults([]);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="ctrl/cmd-k to search"
                className="w-[30vw] h-[45px] rounded-[15px] bg-secondary p-[8px]"
                onFocus={(e) => {
                    // unfocus the input
                    e.target.blur();
                    onOpen();
                }}
            />
            <Modal backdrop={"blur"} isOpen={isOpen} onClose={() => {setSearchQuery(""); setResults([]); onClose();}} scrollBehavior={"inside"} size="4xl" hideCloseButton={true}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1 mt-3">
                        <Input 
                            value={searchQuery}
                            type="text" 
                            placeholder="search for something"
                            onChange={handleSearch} />
                    </ModalHeader>
                    <ModalBody className="flex flex-col items-center">
                        {results.map((resultId) => {
                            const page = pages.find((item) => item.id === resultId);
                            return page ? (
                            <div className="w-full rounded-[15px] bg-secondary p-[8px] cursor-pointer" key={page.id} onClick={() => {
                                onClose();
                                navigate(page.path);
                            }}>
                                <h4>{page.title}</h4>
                                <p className="text-text_col">{page.description}</p>
                            </div>
                            ) : null;
                        })}
                        {
                            results.length === 0 && searchQuery.length > 0 && (
                                <div className="w-full rounded-[15px] bg-secondary p-[8px] cursor-pointer">
                                    <h4>No results found</h4>
                                </div>
                            )
                        }
                    </ModalBody>
                    <div className="mb-4"/>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default GlobalSearch
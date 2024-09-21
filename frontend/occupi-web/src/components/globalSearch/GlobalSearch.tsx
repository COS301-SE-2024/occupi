import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FlexSearch from "flexsearch";
import { content } from "./SearchContent";
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
        content.forEach((page) => {
        index.add(page.id, page.title + " " + page.content);
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
            <Modal backdrop={"blur"} isOpen={isOpen} onClose={onClose} scrollBehavior={"inside"} size="4xl" hideCloseButton={true}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <Input 
                            value={searchQuery}
                            type="text" 
                            placeholder="search for something"
                            onChange={handleSearch} />
                    </ModalHeader>
                    <ModalBody className="flex flex-col items-center">
                        {results.map((resultId) => {
                            const page = content.find((item) => item.id === resultId);
                            return page ? (
                            <li className="w-full rounded-[15px] bg-secondary p-[8px]" key={page.id} onClick={() => alert(page.path)}>
                                {page.title}
                            </li>
                            ) : null;
                        })}
                    </ModalBody>
                    <div className="h-[20px]"/>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default GlobalSearch
// import React from "react";
// import { Pagination, Button } from "@nextui-org/react";

// type BottomContentProps = {
//   selectedKeys: any;
//   filteredItems: any[];
//   page: number;
//   pages: number;
//   onPreviousPage: () => void;
//   onNextPage: () => void;
// };

// export const BottomContent: React.FC<BottomContentProps> = ({
//   selectedKeys,
//   filteredItems,
//   page,
//   pages,
//   onPreviousPage,
//   onNextPage,
// }) => {
//   return (
//     <div className="py-2 px-2 flex flex-col sm:flex-row justify-between items-center gap-4">
//       <span className="text-small text-default-400">
//         {selectedKeys === "all"
//           ? "All items selected"
//           : `${selectedKeys.size} of ${filteredItems.length} selected`}
//       </span>
//       <Pagination
//         isCompact
//         showControls
//         showShadow
//         color="primary"
//         page={page}
//         total={pages}
//         onChange={(page) => console.log({ page })}
//       />
//       <div className="hidden sm:flex justify-end gap-2">
//         <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
//           Previous
//         </Button>
//         <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
//           Next
//         </Button>
//       </div>
//     </div>
//   );
// };
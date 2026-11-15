import { Pagination } from "antd";
import type { PaginationProps } from "antd";

interface IProps {
  totalPages: number;
  currentPage: number;
  onChange: (page: number) => void;
}

const CustomPagination = ({ totalPages, currentPage, onChange }: IProps) => {
  const itemRender: PaginationProps["itemRender"] = (
    page,
    type,
    originalElement,
  ) => {
    if (type === "prev" || type === "next") {
      return (
        <span style={{ display: "inline-block", transform: "rotate(180deg)" }}>
          {originalElement}
        </span>
      );
    }

    return originalElement;
  };

  return (
    <Pagination
      current={currentPage}
      hideOnSinglePage
      onChange={onChange}
      pageSize={1}
      showSizeChanger={false}
      total={totalPages}
      itemRender={itemRender}
    />
  );
};

export default CustomPagination;

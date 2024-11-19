import React from "react";
import {
  SortDescendingOutlined,
  SortAscendingOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { ListGroup, Popover } from "flowbite-react";
import { Button, getIconSvg, TextInput } from "habit-fract-design-system";
import "./common.css";
import { SortCriteria, SortOrder, listSortFilterAtom } from "../../state/ui";
import { store } from "../../state/store";
// import { darkThemeListGroup } from "habit-fract-design-system";
import { useAtomValue } from "jotai";

interface ListSortFilterProps {
  label?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortKey: string | null;
  onSortKeyChange: (key: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: () => void;
}

const ListSortFilter: React.FC<ListSortFilterProps> = ({
  label,
  searchTerm,
  onSearchChange,
  sortKey,
  onSortKeyChange,
  sortOrder,
  onSortOrderChange,
}) => {
  return (
    <div className="list-sort-filter">
      <div className="sort-icon-container flex items-center justify-between gap-4">
        {!!label && <span className="sort-filter-label">{label}</span>}
        
        {/* Search Input */}
        <div className="flex-1">
          <TextInput
            id="search-input"
            name="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            icon="search"
            labelValue={""}
            required={false}
            theme="rounded"
            isListItem={true}
            errored={false}
            withInfo={false}
            disabled={false}
            size="base"
            iconSide="left"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 text-2xl">
          <Popover
            content={
              <ListGroup className="w-48">
                <ListGroup.Item
                  onClick={() => onSortKeyChange('name')}
                  active={sortKey === 'name'}
                >
                  Sort by Name
                </ListGroup.Item>
                <ListGroup.Item
                  onClick={() => onSortKeyChange('scale')}
                  active={sortKey === 'scale'}
                >
                  Sort by Scale
                </ListGroup.Item>
              </ListGroup>
            }
          >
            <Button
              type="button"
              variant="circle-icon-lg btn-neutral outlined"
              icon={getIconSvg("filter")({})}
              className="sort-filter-icon"
            />
          </Popover>
          
          {/* Sort Order Toggle */}
          <Button
            type="button"
            variant="circle-icon-lg btn-neutral outlined"
            icon={getIconSvg("swap-sort")({})}
            className="sort-filter-icon"
            onClick={onSortOrderChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ListSortFilter;
import React, { Dispatch, SetStateAction, useState } from "react";
import styles from "../styles/checkboxes.module.scss";
import { Item } from "../types/item";

interface Props {
  allItems: Item[] | null;
  setFilteredItems: Dispatch<SetStateAction<Item[] | null>>;
}

export default function Checkboxes(props: Props) {
  const { allItems, setFilteredItems } = props;

  const [isChecked, setIsChecked] = useState(false);
  const onChange = (event: any) => {
    const newIsChecked = event.target.checked;
    setIsChecked(newIsChecked);
    if (allItems === null) {
      return;
    }

    const newFilteredItems = allItems.filter((item) => {
      if (isChecked) {
        return true;
      } else {
        for (const tag of item.instance_of) {
          if (tag.includes("human")) {
            return false;
          }
        }
        return true;
      }
    });
    setFilteredItems(newFilteredItems);
  };

  return (
    <div className={styles.checkboxes}>
      <input type="checkbox" checked={isChecked} onChange={onChange} />
      <label>Remove humans?</label>
    </div>
  );
}

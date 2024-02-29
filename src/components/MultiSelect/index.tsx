import Multiselect from "multiselect-react-dropdown";

const MyMultiselect = ({
  options,
  selectedOptions,
  onSelectionChange,
  isSingleSelect,
}) => {
  return (
    <Multiselect
      options={options}
      selectedValues={selectedOptions}
      onSelect={(selectedItems) => onSelectionChange(selectedItems)}
      onRemove={(selectedItems) => onSelectionChange(selectedItems)}
      displayValue="name"
      showCheckbox={true}
      avoidHighlightFirstOption={true}
      placeholder="placeholder"
      hidePlaceholder={true}
      showArrow={true}
      singleSelect={isSingleSelect}
    />
  );
};

export default MyMultiselect;

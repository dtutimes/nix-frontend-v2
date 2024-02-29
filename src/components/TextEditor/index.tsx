import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import "./index.css";

const TextEditor = ({ value, onChange }) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      config={{
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "bulletedList",
            "numberedList",
            "blockQuote",
          ],
        },
        placeholder: "Type your content here.",

        ui: {
          poweredBy: {
            position: "inside",
            side: "left",
            label: "This is",
            horizontalOffset: 5,
            verticalOffset: 5,
          },
        },
      }}
      data={value}
      onChange={(event, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
      onReady={(editor) => {
        //console.debug( 'Editor is ready to use!', editor );
      }}
      onBlur={(event, editor) => {
        // console.debug( 'Blur.', editor );
      }}
      onFocus={(event, editor) => {
        //console.debug( 'Focus.', editor );
      }}
    />
  );
};

export default TextEditor;

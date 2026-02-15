import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Viewer } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

interface TViewerProps {
  markdown: string;
}

const TViewer = ({ markdown }: TViewerProps) => {
  if (!markdown) {
    return (
      <Stack sx={{ background: "#fff", mt: 2, borderRadius: "10px", minHeight: "100px", justifyContent: "center", alignItems: "center" }}>
        <Typography sx={{ color: "#64748b", fontSize: "14px" }}>
          Preview will appear here...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ background: "#fff", mt: 2, borderRadius: "10px" }}>
      <Box component={"div"} sx={{ m: 3 }}>
        <Viewer
          key={markdown}
          initialValue={markdown}
          customHTMLRenderer={{
            htmlBlock: {
              iframe(node: any) {
                return [
                  {
                    type: "openTag",
                    tagName: "iframe",
                    outerNewLine: true,
                    attributes: node.attrs,
                  },
                  { type: "html", content: node.childrenHTML ?? "" },
                  { type: "closeTag", tagName: "iframe", outerNewLine: true },
                ];
              },
              div(node: any) {
                return [
                  { type: "openTag", tagName: "div", outerNewLine: true, attributes: node.attrs },
                  { type: "html", content: node.childrenHTML ?? "" },
                  { type: "closeTag", tagName: "div", outerNewLine: true },
                ];
              },
            },
            htmlInline: {
              big(node: any, { entering }: any) {
                return entering
                  ? { type: "openTag", tagName: "big", attributes: node.attrs }
                  : { type: "closeTag", tagName: "big" };
              },
            },
          }}
        />
      </Box>
    </Stack>
  );
};

export default TViewer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Document } from "@/shared/api/documents";

interface DocumentsState {
  list: Document[];
  selectedIds: string[];
  uploading: boolean;
  loading: boolean;
}

const initialState: DocumentsState = {
  list: [],
  selectedIds: [],
  uploading: false,
  loading: false,
};

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<Document[]>) => {
      state.list = action.payload;
    },
    addDocument: (state, action: PayloadAction<Document>) => {
      state.list.unshift(action.payload);
    },
    removeDocument: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((d) => d.id !== action.payload);
      state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
    },
    toggleSelectedDoc: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((i) => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    clearSelectedDocs: (state) => {
      state.selectedIds = [];
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setDocuments,
  addDocument,
  removeDocument,
  toggleSelectedDoc,
  clearSelectedDocs,
  setUploading,
  setLoading,
} = documentsSlice.actions;
export default documentsSlice.reducer;

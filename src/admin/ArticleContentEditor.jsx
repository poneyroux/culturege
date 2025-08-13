import React, { useState } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Add, Delete, DragIndicator } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";

const BLOCK_TYPES = [
  { value: "text", label: "Texte" },
  { value: "image", label: "Image/Peinture" },
  { value: "video", label: "Vidéo" },
  { value: "quote", label: "Citation" },
  { value: "table", label: "Tableau" },
  { value: "podcast", label: "Podcast Radio France" },
  { value: "pdf", label: "Fichier PDF" },
];

export default function ArticleContentEditor({ source, value, onChange }) {
  const content = value
    ? JSON.parse(value)
    : { blocks: [], finalQuestions: [] };
  const { blocks = [], finalQuestions = [] } = content;

  const updateContent = (
    newBlocks = blocks,
    newFinalQuestions = finalQuestions
  ) => {
    const newContent = {
      blocks: newBlocks,
      finalQuestions: newFinalQuestions,
    };
    onChange(JSON.stringify(newContent));
  };

  const addBlock = (type) => {
    const newBlock = {
      id: uuidv4(),
      type,
      content: "",
      questions: [],
      wikipediaLink: "",
    };
    updateContent([...blocks, newBlock], finalQuestions);
  };

  const updateBlock = (blockId, updates) => {
    const updatedBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    updateContent(updatedBlocks, finalQuestions);
  };

  const removeBlock = (blockId) => {
    const updatedBlocks = blocks.filter((block) => block.id !== blockId);
    updateContent(updatedBlocks, finalQuestions);
  };

  const addQuestion = (blockId) => {
    const newQuestion = { id: uuidv4(), text: "" };
    const block = blocks.find((b) => b.id === blockId);
    updateBlock(blockId, {
      questions: [...(block.questions || []), newQuestion],
    });
  };

  const updateQuestion = (blockId, questionId, text) => {
    const block = blocks.find((b) => b.id === blockId);
    const updatedQuestions = block.questions.map((q) =>
      q.id === questionId ? { ...q, text } : q
    );
    updateBlock(blockId, { questions: updatedQuestions });
  };

  const removeQuestion = (blockId, questionId) => {
    const block = blocks.find((b) => b.id === blockId);
    const updatedQuestions = block.questions.filter((q) => q.id !== questionId);
    updateBlock(blockId, { questions: updatedQuestions });
  };

  const addFinalQuestion = () => {
    const newQuestion = { id: uuidv4(), text: "" };
    updateContent(blocks, [...finalQuestions, newQuestion]);
  };

  const updateFinalQuestion = (questionId, text) => {
    const updatedQuestions = finalQuestions.map((q) =>
      q.id === questionId ? { ...q, text } : q
    );
    updateContent(blocks, updatedQuestions);
  };

  const removeFinalQuestion = (questionId) => {
    const updatedQuestions = finalQuestions.filter((q) => q.id !== questionId);
    updateContent(blocks, updatedQuestions);
  };

  return (
    <Box>
      {/* Boutons d'ajout de blocs */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Ajouter un bloc :
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {BLOCK_TYPES.map((type) => (
            <Button
              key={type.value}
              variant="outlined"
              size="small"
              onClick={() => addBlock(type.value)}
              startIcon={<Add />}
            >
              {type.label}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Liste des blocs */}
      {blocks.map((block, index) => (
        <Paper key={block.id} sx={{ p: 3, mb: 2, border: "1px solid #ddd" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DragIndicator sx={{ color: "grey.500" }} />
              <Typography variant="h6">
                Bloc {index + 1} -{" "}
                {BLOCK_TYPES.find((t) => t.value === block.type)?.label}
              </Typography>
            </Box>
            <IconButton onClick={() => removeBlock(block.id)} color="error">
              <Delete />
            </IconButton>
          </Box>

          {/* Contenu selon le type de bloc */}
          {block.type === "text" && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Contenu texte"
              value={block.content || ""}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              sx={{ mb: 2 }}
            />
          )}

          {(block.type === "image" ||
            block.type === "video" ||
            block.type === "pdf") && (
            <TextField
              fullWidth
              label={`URL ${
                block.type === "image"
                  ? "de l'image"
                  : block.type === "video"
                  ? "YouTube/Vimeo"
                  : "du PDF"
              }`}
              value={block.content || ""}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              sx={{ mb: 2 }}
            />
          )}

          {block.type === "quote" && (
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Citation"
              value={block.content || ""}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              sx={{ mb: 2 }}
            />
          )}

          {block.type === "podcast" && (
            <TextField
              fullWidth
              label="URL iframe Radio France"
              value={block.content || ""}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              placeholder="https://embed.radiofrance.fr/..."
              sx={{ mb: 2 }}
            />
          )}

          {block.type === "table" && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="HTML du tableau"
              value={block.content || ""}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              sx={{ mb: 2 }}
            />
          )}

          {/* Lien Wikipédia */}
          <TextField
            fullWidth
            label="Lien Wikipédia (optionnel)"
            value={block.wikipediaLink || ""}
            onChange={(e) =>
              updateBlock(block.id, { wikipediaLink: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          {/* Questions pour ce bloc */}
          <Box
            sx={{ mt: 3, p: 2, bgcolor: "grey.50", border: "1px solid #000" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Questions après ce bloc
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => addQuestion(block.id)}
                startIcon={<Add />}
              >
                + Question
              </Button>
            </Box>

            {block.questions?.map((question, qIndex) => (
              <Box
                key={question.id}
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Box
                  sx={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: "black",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  {qIndex + 1}
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Question ${qIndex + 1}...`}
                  value={question.text || ""}
                  onChange={(e) =>
                    updateQuestion(block.id, question.id, e.target.value)
                  }
                />
                <IconButton
                  size="small"
                  onClick={() => removeQuestion(block.id, question.id)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            )) || []}

            {(!block.questions || block.questions.length === 0) && (
              <Typography variant="body2" color="grey.600" fontStyle="italic">
                Aucune question pour ce bloc
              </Typography>
            )}
          </Box>
        </Paper>
      ))}

      {/* Questions finales */}
      <Paper sx={{ p: 3, mb: 2, bgcolor: "grey.50" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Questions finales</Typography>
          <Button
            variant="outlined"
            onClick={addFinalQuestion}
            startIcon={<Add />}
          >
            + Question finale
          </Button>
        </Box>

        {finalQuestions.map((question, index) => (
          <Box
            key={question.id}
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
          >
            <Box
              sx={{
                minWidth: 24,
                height: 24,
                borderRadius: "50%",
                bgcolor: "green",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: "bold",
              }}
            >
              {index + 1}
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder={`Question finale ${index + 1}...`}
              value={question.text || ""}
              onChange={(e) => updateFinalQuestion(question.id, e.target.value)}
            />
            <IconButton
              size="small"
              onClick={() => removeFinalQuestion(question.id)}
              color="error"
            >
              <Delete />
            </IconButton>
          </Box>
        ))}

        {finalQuestions.length === 0 && (
          <Typography variant="body2" color="grey.600" fontStyle="italic">
            Aucune question finale
          </Typography>
        )}
      </Paper>

      {blocks.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", color: "grey.600" }}>
          <Typography>
            Aucun bloc ajouté. Utilisez les boutons ci-dessus pour commencer.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

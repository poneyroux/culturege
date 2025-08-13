import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import { Add, Article, Palette, Image } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <Typography variant="h4" gutterBottom>
        Culture Générale - Administration
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Gérez votre contenu éducatif
      </Typography>

      <Grid container spacing={3}>
        {/* Actions rapides */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Articles" />
            <CardContent>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate("/admin/articles/create")}
                sx={{ mb: 1 }}
              >
                Nouvel article
              </Button>
              <Button
                fullWidth
                variant="text"
                startIcon={<Article />}
                onClick={() => navigate("/admin/articles")}
              >
                Gérer les articles
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Thèmes" />
            <CardContent>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate("/admin/themes/create")}
                sx={{ mb: 1 }}
              >
                Nouveau thème
              </Button>
              <Button
                fullWidth
                variant="text"
                startIcon={<Palette />}
                onClick={() => navigate("/admin/themes")}
              >
                Gérer les thèmes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Médiathèque" />
            <CardContent>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate("/admin/media")}
                sx={{ mb: 1 }}
              >
                Uploader une image
              </Button>
              <Button
                fullWidth
                variant="text"
                startIcon={<Image />}
                onClick={() => navigate("/admin/media")}
              >
                Voir la médiathèque
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

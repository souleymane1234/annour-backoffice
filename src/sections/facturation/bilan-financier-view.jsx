import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Tab,
  Card,
  Tabs,
  Stack,
  Table,
  Select,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Container,
  Typography,
  InputLabel,
  FormControl,
  TableContainer,
} from '@mui/material';

import { useNotification } from 'src/hooks/useNotification';
import { useAdminStore } from 'src/store/useAdminStore';

import { fNumber } from 'src/utils/format-number';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const MONTHS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

export default function BilanFinancierView() {
  const { contextHolder } = useNotification();
  const { admin } = useAdminStore();
  const [currentTab, setCurrentTab] = useState('mensuel');
  const [loading, setLoading] = useState(false);

  // Bilan mensuel
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [bilanMensuel, setBilanMensuel] = useState(null);

  // Bilan annuel
  const [selectedYearAnnuel, setSelectedYearAnnuel] = useState(new Date().getFullYear());
  const [bilanAnnuel, setBilanAnnuel] = useState(null);

  // Générer les années (5 dernières années)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Vérifier les permissions pour GERANT au début du composant
  const role = (admin?.role || '').toUpperCase();
  if (role === 'GERANT') {
    return (
      <Container maxWidth="xl">
        {contextHolder}
        <Helmet>
          <title>Bilan Financier | Annour Travel</title>
        </Helmet>
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Iconify icon="solar:lock-bold" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary">
            Accès refusé
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Vous n&apos;avez pas les permissions nécessaires pour accéder au bilan financier.
          </Typography>
        </Box>
      </Container>
    );
  }

  const loadBilanMensuel = useCallback(async () => {
    setLoading(true);
    try {
      const result = await ConsumApi.getBilanMensuel(selectedMonth, selectedYear);
      if (result.success) {
        setBilanMensuel(result.data);
      } else {
        setBilanMensuel(null);
      }
    } catch (error) {
      console.error('Error loading bilan mensuel:', error);
      setBilanMensuel(null);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  const loadBilanAnnuel = useCallback(async () => {
    setLoading(true);
    try {
      const result = await ConsumApi.getBilanAnnuel(selectedYearAnnuel);
      if (result.success) {
        setBilanAnnuel(result.data);
      } else {
        setBilanAnnuel(null);
      }
    } catch (error) {
      console.error('Error loading bilan annuel:', error);
      setBilanAnnuel(null);
    } finally {
      setLoading(false);
    }
  }, [selectedYearAnnuel]);

  useEffect(() => {
    if (currentTab === 'mensuel') {
      loadBilanMensuel();
    } else {
      loadBilanAnnuel();
    }
  }, [currentTab, loadBilanMensuel, loadBilanAnnuel]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderBilanMensuel = () => {
    if (!bilanMensuel) {
      return (
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Aucune donnée disponible
          </Typography>
        </Card>
      );
    }

    const { revenus, depenses, factures, bilan } = bilanMensuel;

    return (
      <Stack spacing={3}>
        {/* Sélecteurs */}
        <Card sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Mois</InputLabel>
              <Select
                value={selectedMonth}
                label="Mois"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {MONTHS.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Année</InputLabel>
              <Select
                value={selectedYear}
                label="Année"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Card>

        {/* Tableau de synthèse */}
        <Card>
          <Scrollbar>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Élément</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Montant (FCFA)</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Détails</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:money-bag-bold" width={20} color="success.main" />
                        <Typography variant="body2" fontWeight="medium">Revenus</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="success.main">
                        {fNumber(revenus?.total || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {revenus?.nombrePaiements || 0} paiement(s)
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:card-bold" width={20} color="error.main" />
                        <Typography variant="body2" fontWeight="medium">Dépenses</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="error.main">
                        {fNumber(depenses?.total || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {depenses?.nombreBons || 0} bon(s) de sortie
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:chart-bold" width={20} />
                        <Typography variant="body2" fontWeight="bold">Bilan (Solde)</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h5" color={bilan?.solde >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                        {fNumber(bilan?.solde || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        Marge: {bilan?.marge || '0.00'}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>

        {/* Tableau des revenus par méthode */}
        {revenus?.parMethode && Object.keys(revenus.parMethode).length > 0 && (
          <Card>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Revenus par méthode de paiement</Typography>
            </Box>
            <Scrollbar>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">Méthode de paiement</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Montant (FCFA)</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(revenus.parMethode).map(([methode, montant]) => (
                      <TableRow key={methode} hover>
                        <TableCell>
                          <Typography variant="body2" textTransform="capitalize">{methode.replace(/_/g, ' ')}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">{fNumber(montant)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>
        )}

        {/* Tableau des dépenses par catégorie */}
        {depenses?.parCategorie && Object.keys(depenses.parCategorie).length > 0 && (
          <Card>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Dépenses par catégorie</Typography>
            </Box>
            <Scrollbar>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">Catégorie</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Montant (FCFA)</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(depenses.parCategorie).map(([categorie, montant]) => (
                      <TableRow key={categorie} hover>
                        <TableCell>
                          <Typography variant="body2" textTransform="capitalize">{categorie.replace(/_/g, ' ')}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color="error.main">{fNumber(montant)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>
        )}

        {/* Tableau des factures */}
        <Card>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Résumé des factures</Typography>
          </Box>
          <Scrollbar>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Type</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Montant (FCFA)</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="body2">Total facturé</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">{fNumber(factures?.total || 0)}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="body2" color="success.main">Factures payées</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        {fNumber(factures?.payees || 0)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="body2" color="warning.main">Factures en attente</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium" color="warning.main">
                        {fNumber(factures?.enAttente || 0)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>
      </Stack>
    );
  };

  const renderBilanAnnuel = () => {
    if (!bilanAnnuel) {
      return (
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Aucune donnée disponible
          </Typography>
        </Card>
      );
    }

    const { revenus, depenses, factures, bilan } = bilanAnnuel;

    return (
      <Stack spacing={3}>
        {/* Sélecteur */}
        <Card sx={{ p: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Année</InputLabel>
            <Select
              value={selectedYearAnnuel}
              label="Année"
              onChange={(e) => setSelectedYearAnnuel(e.target.value)}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Card>

        {/* Tableau de synthèse */}
        <Card>
          <Scrollbar>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Élément</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Montant (FCFA)</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Détails</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:money-bag-bold" width={20} color="success.main" />
                        <Typography variant="body2" fontWeight="medium">Revenus Totaux</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="success.main">
                        {fNumber(revenus?.total || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {revenus?.nombrePaiements || 0} paiement(s)
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:card-bold" width={20} color="error.main" />
                        <Typography variant="body2" fontWeight="medium">Dépenses Totales</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="error.main">
                        {fNumber(depenses?.total || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {depenses?.nombreBons || 0} bon(s) de sortie
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:chart-bold" width={20} />
                        <Typography variant="body2" fontWeight="bold">Bilan Annuel (Solde)</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h5" color={bilan?.solde >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                        {fNumber(bilan?.solde || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        Marge: {bilan?.marge || '0.00'}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>

        {/* Tableau des revenus par mois */}
        {revenus?.parMois && revenus.parMois.length > 0 && (
          <Card>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Revenus par mois</Typography>
            </Box>
            <Scrollbar>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">Mois</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Montant (FCFA)</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Nombre de paiements</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenus.parMois.map((mois) => (
                      <TableRow key={mois.mois} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {MONTHS.find((m) => m.value === mois.mois)?.label || `Mois ${mois.mois}`}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            {fNumber(mois.montant)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {mois.nombre || 0}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>
        )}

        {/* Tableau des dépenses par mois */}
        {depenses?.parMois && depenses.parMois.length > 0 && (
          <Card>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Dépenses par mois</Typography>
            </Box>
            <Scrollbar>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">Mois</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Montant (FCFA)</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Nombre de bons</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {depenses.parMois.map((mois) => (
                      <TableRow key={mois.mois} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {MONTHS.find((m) => m.value === mois.mois)?.label || `Mois ${mois.mois}`}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color="error.main">
                            {fNumber(mois.montant)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {mois.nombre || 0}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>
        )}

        {/* Tableau des dépenses par catégorie */}
        {depenses?.parCategorie && Object.keys(depenses.parCategorie).length > 0 && (
          <Card>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Dépenses par catégorie</Typography>
            </Box>
            <Scrollbar>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">Catégorie</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Montant (FCFA)</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(depenses.parCategorie).map(([categorie, montant]) => (
                      <TableRow key={categorie} hover>
                        <TableCell>
                          <Typography variant="body2" textTransform="capitalize">{categorie.replace(/_/g, ' ')}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color="error.main">{fNumber(montant)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>
        )}

        {/* Tableau des factures */}
        <Card>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Résumé des factures</Typography>
          </Box>
          <Scrollbar>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Type</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Montant (FCFA)</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Nombre</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="body2">Total facturé</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">{fNumber(factures?.total || 0)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">{factures?.nombre || 0}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="body2" color="success.main">Factures payées</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        {fNumber(factures?.payees || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="body2" color="warning.main">Factures en attente</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium" color="warning.main">
                        {fNumber(factures?.enAttente || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>
      </Stack>
    );
  };

  return (
    <>
      {contextHolder}
      <Helmet>
        <title> Bilan financier | Annour Travel </title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Bilan financier</Typography>
        </Stack>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="bilan tabs">
            <Tab label="Bilan Mensuel" value="mensuel" icon={<Iconify icon="eva:calendar-fill" />} iconPosition="start" />
            <Tab label="Bilan Annuel" value="annuel" icon={<Iconify icon="eva:calendar-outline" />} iconPosition="start" />
          </Tabs>
        </Box>

        {loading ? (
          <Card sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Chargement...
            </Typography>
          </Card>
        ) : (
          <Box>
            {currentTab === 'mensuel' && renderBilanMensuel()}
            {currentTab === 'annuel' && renderBilanAnnuel()}
          </Box>
        )}
      </Container>
    </>
  );
}


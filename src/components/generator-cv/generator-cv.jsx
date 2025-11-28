import React from 'react';
import PropTypes from 'prop-types';
import { Page, Text, View, Font, Document, StyleSheet } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';

import { degreeAccademy } from 'src/constants/skill';
import OpenSansBold from 'src/assets/fonts/Open_Sans/static/OpenSans-Bold.ttf';
import OpenSansLight from 'src/assets/fonts/Open_Sans/static/OpenSans-Light.ttf';
import OpenSansRegular from 'src/assets/fonts/Open_Sans/static/OpenSans-Regular.ttf';

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: OpenSansLight, fontWeight: 300 }, // Light
    { src: OpenSansRegular, fontWeight: 400 }, // Regular
    { src: OpenSansBold, fontWeight: 700 }, // Bold
  ],
});

// Styles du PDF
const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 10 },
  table: { width: '100%', border: '1px solid black', marginTop: 10 },
  row: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
    display: 'flex',
    minHeight: 20,
    width: '100%',
  },
  cellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    width: '35%',
    paddingHorizontal: 10,
    borderRight: '1px solid black',
    borderLeft: '1px solid black',
  },
  cell: {
    fontSize: 10,
    width: '60%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellItems: { width: '60%' },
  cellNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '5%',
    heigth: '100%',
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 700,
    fontFamily: 'Open Sans',
  },
  simpleText: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 300,
    fontFamily: 'Open Sans',
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 400,
    fontFamily: 'Open Sans',
  },
});

// Composant du CV sous forme de tableau
const CVDocument = ({ userData }) => {
  const name = userData.fullName.split(' ')[0];
  const firstName = userData.fullName.substring(userData.fullName.indexOf(' ') + 1);
  // Vérifier le nombre d'expériences et compléter jusqu'à 7
  const filledExperiences = [...userData.experiences];
  const filledCertifications = [...userData.certificationsOnShore, ...userData.certifications];
  while (filledExperiences.length < 7) {
    filledExperiences.push({ position: '', company: '', begin_at: '', end_at: '' });
  }
  while (filledCertifications.length < 5) {
    filledCertifications.push({ certification: '', expire_at: '' });
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
          }}
        >
          <View>
            <Text style={styles.title}>FICHE INDIVIDUELLE</Text>
            <Text style={styles.title}>INDIVIDUAL STATUS</Text>
          </View>
          <Text style={styles.title}>ICM</Text>
        </View>

        {/* TABLEAU PRINCIPAL */}
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={styles.cellNumber}>
              <Text style={styles.simpleText}>1</Text>
            </View>
            <View style={styles.cellHeader}>
              <Text style={styles.subtitle}>Nom (last name)</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.simpleText}>{name}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.cellNumber}>
              <Text style={styles.simpleText}>2</Text>
            </View>
            <View style={styles.cellHeader}>
              <Text style={styles.subtitle}>PRENOMS (First Name)</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.simpleText}>{firstName}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.cellNumber}>
              <Text style={styles.simpleText}>3</Text>
            </View>
            <View style={styles.cellHeader}>
              <Text style={styles.subtitle}>
                Date et Lieu de Naissance (Date and Place of birth)
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.simpleText}>
                {fDate(userData.birthDate)} à {userData.birthPlace}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cellNumber}>
              <Text style={styles.simpleText}>4</Text>
            </View>
            <View style={styles.cellHeader}>
              <Text style={styles.subtitle}>
                Statut Matrimonial et Nombre d&apos;enfants (Marital Status)
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.simpleText} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cellNumber}>
              <Text style={styles.simpleText}>5</Text>
            </View>
            <View style={styles.cellHeader}>
              <Text style={styles.subtitle}>Contacts</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.simpleText} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cellNumber}>
              <Text style={styles.simpleText}>6</Text>
            </View>
            <View style={styles.cellHeader}>
              <Text style={styles.subtitle}>Personne à contacter (contacts)</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.simpleText} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cellNumber}>
              <Text style={styles.simpleText}>7</Text>
            </View>
            <View style={styles.cellHeader}>
              <Text style={styles.subtitle}>Nationalité (Nationality)</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.simpleText}>{userData.nationality}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cellNumber}>
              <Text style={styles.simpleText}>8</Text>
            </View>
            <View style={styles.cellHeader}>
              <Text style={styles.subtitle}>
                Expérience professionnelle (Professional experience)
              </Text>
            </View>
            <View style={styles.cellItems}>
              <View style={styles.row}>
                <View
                  style={{
                    flex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: '1px solid black',
                    paddingHorizontal: 15,
                  }}
                >
                  <Text style={styles.subtitle}>SOCIETES (Compagnies)</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: '1px solid black',
                    paddingHorizontal: 15,
                  }}
                >
                  <Text style={styles.subtitle}>POSITIONS (Position)</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 15,
                  }}
                >
                  <Text style={styles.subtitle}>PERIODES (Period)</Text>
                </View>
              </View>
              {filledExperiences.map((exp, index) => (
                <View key={`exp-${index}`} style={styles.row}>
                  <View
                    style={{
                      flex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid black',
                      paddingHorizontal: 5,
                    }}
                  >
                    <Text style={styles.simpleText}>{exp.company}</Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid black',
                      paddingHorizontal: 5,
                    }}
                  >
                    <Text style={styles.simpleText}>{exp.position}</Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 5,
                    }}
                  >
                    {exp.begin_at.length > 0 ? (
                      <Text style={styles.simpleText}>
                        {fDate(exp.begin_at)} - {exp.end_at ? fDate(exp.end_at) : 'En cours'}
                      </Text>
                    ) : (
                      <Text />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cellNumber}>
              <Text style={styles.simpleText}>9</Text>
            </View>
            <View style={styles.cellHeader}>
              <Text style={styles.subtitle}>Formation (Training)</Text>
            </View>
            <View style={styles.cellItems}>
              <View style={styles.row}>
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: '1px solid black',
                    paddingHorizontal: 15,
                  }}
                >
                  <Text style={styles.subtitle}>CERTIFICATS (certificates)</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 15,
                  }}
                >
                  <Text style={styles.subtitle}>DATE D&apos;EXPIRATION (expiry date)</Text>
                </View>
              </View>
              {filledCertifications.map(({ certification, expire_at }, index) => (
                <View key={`certification-${index}`} style={styles.row}>
                  <View
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid black',
                      paddingHorizontal: 5,
                    }}
                  >
                    <Text style={styles.simpleText}>{certification}</Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 5,
                    }}
                  >
                    {expire_at && expire_at.length > 0 ? (
                      <Text style={styles.simpleText}>{fDate(expire_at)}</Text>
                    ) : (
                      <Text />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cellNumber}>
              <Text style={styles.simpleText}>10</Text>
            </View>
            <View style={styles.cellHeader}>
              <Text style={styles.subtitle}>Diplômes (Diplomas)</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.simpleText}>
                {
                  degreeAccademy.find(
                    (degreeItem) =>
                      parseInt(degreeItem.value.split(':')[1], 10) === userData.levelGruaduate
                  ).label
                }
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cellNumber}>
              <Text style={styles.simpleText}>11</Text>
            </View>
            <View style={styles.cellHeader}>
              <Text style={styles.subtitle}>Langues (Languages)</Text>
            </View>
            <View style={styles.cellItems}>
              <View style={styles.row}>
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: '1px solid black',
                    paddingHorizontal: 15,
                  }}
                >
                  <Text style={styles.subtitle}>Ecrit (Written)</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 15,
                  }}
                >
                  <Text style={styles.subtitle}>Parlé (spoken)</Text>
                </View>
              </View>
            </View>
          </View>
          {userData.languages.map(({ title, written, spoken }, index) => (
            <View key={`language-${index}`} style={styles.row}>
              <View style={styles.cellNumber}>
                <Text style={styles.simpleText}>{12 + index}</Text>
              </View>
              <View style={styles.cellHeader}>
                <Text style={styles.subtitle}>* {title}</Text>
              </View>
              <View style={styles.cellItems}>
                <View style={styles.row}>
                  <View
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid black',
                      paddingHorizontal: 15,
                    }}
                  >
                    <Text style={styles.subtitle}>{written}</Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 15,
                    }}
                  >
                    <Text style={styles.subtitle}>{spoken}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 5 }}>
          <Text
            style={{
              ...styles.title,
              fontSize: 10,
              textDecoration: 'underline',
              textAlign: 'left',
            }}
          >
            For the languages
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ ...styles.title, fontSize: 10 }}>A = Very good</Text>
            <Text style={{ ...styles.title, fontSize: 10 }}>B = Medium</Text>
            <Text style={{ ...styles.title, fontSize: 10 }}>C = Not at all</Text>
          </View>
        </View>
        <View style={{ marginTop: 5 }}>
          <Text
            style={{
              ...styles.title,
              fontSize: 10,
              textDecoration: 'underline',
              textAlign: 'left',
            }}
          >
            Pour les langues
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ ...styles.title, fontSize: 10 }}>A = Très bien</Text>
            <Text style={{ ...styles.title, fontSize: 10 }}>B = Bien</Text>
            <Text style={{ ...styles.title, fontSize: 10 }}>C = Pas du tout</Text>
          </View>
        </View>

        {/* Diplômes */}
        {/* <Text style={styles.title}>Diplômes</Text>
        <View style={styles.table}>
          {userData.diplomes.map((diplome, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.cell}>{diplome.nom}</Text>
              <Text style={styles.cell}>{diplome.date}</Text>
            </View>
          ))}
        </View> */}
      </Page>
    </Document>
  );
};

CVDocument.propTypes = {
  userData: PropTypes.object.isRequired,
};

export default CVDocument;

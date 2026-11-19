import { useEffect, useMemo, useState } from 'react'
import { fetchPatioQuote, type PatioOptions, type PatioQuote } from '../api/ombrage'
import { lireSaisie, patioComplet, versDimensions } from './patioOmbrage'

/**
 * Saisie du client et devis calculé par le serveur pour ses patios.
 *
 * Partagé par les pages de calibrage (technique) et de chiffrage (financier) :
 * toutes deux s'appuient sur le même devis.
 */
export function usePatioDevis() {
  const saisie = useMemo(lireSaisie, [])
  const saisieValide = saisie.patios.every(patioComplet)
  const dimensions = useMemo(() => versDimensions(saisie.patios), [saisie])
  const options: PatioOptions = useMemo(
    () => ({
      verificationAnnuelle: saisie.verificationAnnuelle,
      interventionSaisonniere: saisie.interventionSaisonniere,
    }),
    [saisie],
  )

  const [devis, setDevis] = useState<PatioQuote | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    if (!saisieValide) return
    let annule = false
    fetchPatioQuote(dimensions, options)
      .then((resultat) => {
        if (!annule) setDevis(resultat)
      })
      .catch(() => {
        if (!annule) setErreur("Le calcul n'a pas pu être effectué. Réessayez dans un instant.")
      })
    return () => {
      annule = true
    }
  }, [dimensions, options, saisieValide])

  return { saisie, saisieValide, devis, erreur }
}

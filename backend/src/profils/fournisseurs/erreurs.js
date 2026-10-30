/** Erreur d'un fournisseur de profils : son nom, un code court (injoignable, statut, illisible, quota…) et un message. */
export class ErreurFournisseur extends Error {
  constructor(fournisseur, code, message) {
    super(message)
    this.name = 'ErreurFournisseur'
    this.fournisseur = fournisseur
    this.code = code
  }
}

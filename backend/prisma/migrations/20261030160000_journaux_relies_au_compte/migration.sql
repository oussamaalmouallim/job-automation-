-- Lot L0.5 : chaque journal de post appartient à un compte ; supprimer le compte supprime ses journaux.
-- Les journaux d'avant les comptes gardent userId = NULL.
-- AddForeignKey
ALTER TABLE "GeneratedPostLog" ADD CONSTRAINT "GeneratedPostLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

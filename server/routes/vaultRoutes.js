import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { createVaultController, getVaultController, unlockVaultController, consumeVaultController, downloadVaultFileController } from '../controllers/vaultController.js'

const router = Router()

router.post('/create', upload.array('files', 20), createVaultController)
router.post('/unlock', unlockVaultController)
router.post('/consume', consumeVaultController)
router.get('/download/:code/:fileId', downloadVaultFileController)
router.get('/:code', getVaultController)

export default router

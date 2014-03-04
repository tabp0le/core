<?php
/**
 * Copyright (c) 2013 Robin Appelman <icewind@owncloud.com>
 * Copyright (c) 2014 Vincent Petry <pvince81@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OC;

use OC\Hooks\BasicEmitter;

class Repair extends BasicEmitter {
	/**
	 * run a series of repair steps for common problems
	 * progress can be reported by emitting \OC\Repair::step events
	 */
	public function run() {
		// TODO: add register repair steps mechanism so that apps
		// can also provide repair steps to repair apps
		$this->fixLegacyHomeStorages();
	}

	private function extractUserId($storageId) {
		$storageId = rtrim($storageId, '/');
		$pos = strrpos($storageId, '/');
		return substr($storageId, $pos + 1);
	}

	/**
	 * Converts legacy home storage ids in the format
	 * "local::/data/dir/patH/userid/" to the new format "home::userid"
	 */
	private function fixLegacyHomeStorages() {
		$dataDir = \OC_Config::getValue('datadirectory', \OC::$SERVERROOT . '/data/');
		$dataDir = rtrim($dataDir, '/') . '/';
		$dataDirId = 'local::' . $dataDir;

		$count = 0;

		\OC_DB::beginTransaction();

		// note: not doing a direct UPDATE with the REPLACE function
		// because regexp search/extract is needed and it is not guaranteed
		// to work on all database types
		$sql = 'SELECT `id` FROM `*PREFIX*storages`'
			. ' WHERE `id` LIKE ?'
			. ' ORDER BY `id`';
		$result = \OC_DB::executeAudited($sql, array($dataDirId . '%'));
		while ($row = $result->fetchRow()) {
			$currentId = $row['id'];
			// one entry is the datadir itself
			if ($currentId === $dataDirId) {
				continue;
			}
			$userId = $this->extractUserId($currentId);
			$newId = 'home::' . $userId;
			$sql = 'UPDATE `*PREFIX*storages`'
				. ' SET id = ?'
				. ' WHERE id = ?';
			$rowCount = \OC_DB::executeAudited($sql, array($newId, $currentId));
			if ($rowCount === 1) {
				$count++;
			}
		}

		$this->emit('\OC\Repair', 'step', array('Updated ' . $count . ' legacy home storage ids'));

		\OC_DB::commit();
	}
}

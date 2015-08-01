class CreateCalls < ActiveRecord::Migration
  def change
    create_table :calls do |t|
      t.string :first_name
      t.string :last_name
      t.string :telephone
      t.text :notes
      t.boolean :insurance

      t.timestamps
    end
  end
end
